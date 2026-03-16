import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  MdSmartToy,
  MdClose,
  MdSend,
  MdAutoAwesome,
  MdRefresh,
  MdDirectionsCar,
} from "react-icons/md";

const API_BASE = "http://localhost:4000/api/v1/chat";
const CHAT_STORAGE_KEY = "evrental_chat_conversation_id";
const CHAT_MESSAGES_KEY = "evrental_chat_messages";

const INITIAL_MESSAGE =
  "Xin chào 👋 Mình là trợ lý AI của EV Rental System. Mình có thể giúp bạn chọn xe phù hợp, gợi ý loại xe theo số người, thời gian thuê và điểm đi.";

const buildInitialMessages = () => [
  {
    role: "assistant",
    content: INITIAL_MESSAGE,
    vehicles: [],
    action: "chat",
    context: null,
  },
];

const normalizeStoredMessage = (msg) => ({
  role: msg?.role === "user" ? "user" : "assistant",
  content: msg?.content || "",
  vehicles: Array.isArray(msg?.vehicles) ? msg.vehicles : [],
  action: msg?.action || "chat",
  context: msg?.context || null,
});

export default function ChatWidget({ isOpen, onClose }) {
  const navigate = useNavigate();
  const messageEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_MESSAGES_KEY);
      if (!saved) return buildInitialMessages();

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return buildInitialMessages();
      }

      return parsed.map(normalizeStoredMessage);
    } catch {
      return buildInitialMessages();
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    return sessionStorage.getItem(CHAT_STORAGE_KEY) || null;
  });

  useEffect(() => {
    sessionStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      sessionStorage.setItem(CHAT_STORAGE_KEY, conversationId);
    } else {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);

    return () => clearTimeout(timer);
  }, [isOpen, messages, loading, bootstrapping]);

  useEffect(() => {
    if (!isOpen) return;

    const ensureConversation = async () => {
      if (bootstrapping) return;

      const savedConversationId = sessionStorage.getItem(CHAT_STORAGE_KEY);

      if (savedConversationId) {
        try {
          setBootstrapping(true);

          const res = await fetch(`${API_BASE}/conversations/${savedConversationId}`);

          if (res.ok) {
            const data = await res.json();
            const conversation = data?.data;

            if (conversation?.id) {
              setConversationId(savedConversationId);

              const hasStoredMessages = (() => {
                try {
                  const stored = JSON.parse(
                    sessionStorage.getItem(CHAT_MESSAGES_KEY) || "[]"
                  );
                  return Array.isArray(stored) && stored.length > 1;
                } catch {
                  return false;
                }
              })();

              if (
                !hasStoredMessages &&
                Array.isArray(conversation.messages) &&
                conversation.messages.length > 0
              ) {
                const restoredMessages = [
                  {
                    role: "assistant",
                    content: INITIAL_MESSAGE,
                    vehicles: [],
                    action: "chat",
                    context: null,
                  },
                  ...conversation.messages.map((msg) => ({
                    role: msg.role === "model" ? "assistant" : "user",
                    content: msg.text || "",
                    vehicles: Array.isArray(msg.matchedVehicles)
                      ? msg.matchedVehicles
                      : [],
                    action: msg.action || "chat",
                    context: msg.context || null,
                  })),
                ];

                setMessages(restoredMessages);
              }

              return;
            }
          }
        } catch (error) {
          console.error("Restore conversation failed:", error);
        } finally {
          setBootstrapping(false);
        }

        setConversationId(null);
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      }

      try {
        setBootstrapping(true);

        const res = await fetch(`${API_BASE}/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        const newConversationId = data?.data?.conversationId;

        if (newConversationId) {
          setConversationId(newConversationId);
          sessionStorage.setItem(CHAT_STORAGE_KEY, newConversationId);
        }
      } catch (error) {
        console.error("Create conversation failed:", error);
      } finally {
        setBootstrapping(false);
      }
    };

    ensureConversation();
  }, [isOpen]);

  const formatBotReply = (text) => {
    if (!text) return "Mình chưa có câu trả lời phù hợp.";

    let cleaned = text
      .replace(/\*\*/g, "")
      .replace(/^\s*[-*]\s*/gm, "• ")
      .replace(/Here'?s a quick overview:/gi, "Mình tóm tắt nhanh như sau:")
      .replace(/Type:/gi, "Loại xe:")
      .replace(/Design:/gi, "Thiết kế:")
      .replace(/Target Market:/gi, "Phù hợp:")
      .replace(/Range:/gi, "Phạm vi di chuyển:")
      .replace(/Battery:/gi, "Pin:")
      .replace(/Interior:/gi, "Nội thất:")
      .replace(/Performance:/gi, "Vận hành:")
      .replace(/E-Ride Việt Nam/gi, "EV Rental System")
      .replace(/E-Ride/gi, "EV Rental System")
      .replace(
        /trợ lý ảo của .*?(?=[,.!]|$)/gi,
        "trợ lý AI của EV Rental System"
      )
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleaned.length > 1400) {
      cleaned = `${cleaned.slice(0, 1400).trim()}…`;
    }

    return cleaned;
  };

  const appendAssistantMessage = (
    content,
    vehicles = [],
    action = "chat",
    context = null
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content,
        vehicles,
        action,
        context,
      },
    ]);
  };

  const startNewConversation = async () => {
    setLoading(false);
    setConversationId(null);
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    sessionStorage.removeItem(CHAT_MESSAGES_KEY);
    setMessages(buildInitialMessages());
    setInput("");

    try {
      setBootstrapping(true);

      const res = await fetch(`${API_BASE}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      const newConversationId = data?.data?.conversationId;

      if (newConversationId) {
        setConversationId(newConversationId);
        sessionStorage.setItem(CHAT_STORAGE_KEY, newConversationId);
      }
    } catch (error) {
      console.error("Start new conversation failed:", error);
    } finally {
      setBootstrapping(false);
    }
  };

  const buildBookingState = (vehicle, context) => {
    const bookingState = {
      selectedVehicle: {
        ...vehicle,
        _id: vehicle.id,
      },
    };

    if (context) {
      bookingState.bookingSearchData = {
        fromSearch: true,
        rentalType: context.hasDriver ? "with_driver" : "self_drive",
        pickupLocation: context.pickupLocation || context.destination || "",
        dropoffLocation:
          context.dropoffLocation ||
          context.pickupLocation ||
          context.destination ||
          "",
        startDate: context.startDate || "",
        endDate: context.endDate || "",
        days: context.days || undefined,
      };
    }

    return bookingState;
  };

  const handleBookVehicle = (vehicle, context) => {
    navigate("/booking", {
      state: buildBookingState(vehicle, context),
    });
  };

  const sendMessage = async (presetMessage) => {
    const userInput = (presetMessage ?? input).trim();
    if (!userInput || loading || bootstrapping) return;

    if (!conversationId) {
      appendAssistantMessage(
        "Mình đang khởi tạo cuộc trò chuyện, bạn thử lại sau 1 giây nhé."
      );
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userInput,
        vehicles: [],
        action: "chat",
        context: null,
      },
    ]);

    if (!presetMessage) setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userInput,
            systemPrompt: `
Hãy tiếp tục đúng ngữ cảnh cuộc trò chuyện này.

Ràng buộc thêm:
- Nếu backend đã cung cấp danh sách xe phù hợp thì hãy ưu tiên tư vấn theo danh sách đó
- Không được bịa xe ngoài danh sách
- Nếu người dùng đang trả lời ngắn như "SUV", "MPV", "vf7", "5 ngày", "4 người", "audi", "bmw" thì phải hiểu là bổ sung ngữ cảnh
- Nếu user hỏi ngoài phạm vi thuê xe thì phải từ chối lịch sự
- Không hỏi lại thông tin đã rõ
- Nếu đủ dữ liệu thì bắt đầu gợi ý xe hoặc bước tiếp theo
- Nếu chưa đủ dữ liệu, chỉ hỏi đúng 1 câu ngắn
- Trả lời như chat thật, không cứng nhắc
            `,
          }),
        }
      );

      const data = await res.json();

      const reply =
        data?.data?.reply ||
        "Mình chưa hiểu ý bạn lắm, bạn nói rõ thêm giúp mình nhé.";

      const matchedVehicles = Array.isArray(data?.data?.matchedVehicles)
        ? data.data.matchedVehicles
        : [];

      const action = data?.data?.action || "chat";
      const context = data?.data?.context || null;

      appendAssistantMessage(
        formatBotReply(reply),
        matchedVehicles,
        action,
        context
      );
    } catch (error) {
      console.error("Send message failed:", error);
      appendAssistantMessage(
        "Hiện mình chưa kết nối được tới hệ thống AI. Bạn thử lại sau giúp mình nhé."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const value = Number(price);
    if (!Number.isFinite(value) || value <= 0) return "Liên hệ";

    const realPrice = value * 1000;
    return `${realPrice.toLocaleString("vi-VN")}đ/ngày`;
  };

  const renderVehicleCards = (vehicles, context) => {
    if (!Array.isArray(vehicles) || vehicles.length === 0) return null;

    return (
      <div className="mt-3 space-y-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
          >
            {vehicle.image ? (
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="h-28 w-full object-cover"
              />
            ) : null}

            <div className="p-3">
              <div className="text-sm font-bold text-slate-800">
                {vehicle.name}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                {[
                  vehicle.brand,
                  vehicle.type,
                  vehicle.seats ? `${vehicle.seats} chỗ` : null,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </div>

              {vehicle.year || vehicle.color ? (
                <div className="mt-1 text-xs text-slate-400">
                  {[vehicle.year, vehicle.color].filter(Boolean).join(" • ")}
                </div>
              ) : null}

              <div className="mt-2 text-sm font-bold text-sky-600">
                {formatPrice(vehicle.price)}
              </div>

              <button
                onClick={() => handleBookVehicle(vehicle, context)}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:from-sky-600 hover:to-blue-700"
              >
                <MdDirectionsCar className="text-sm" />
                Đặt xe này
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed bottom-24 right-6 z-[99999] w-[392px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-blue-600 px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
              <MdAutoAwesome className="text-2xl" />
            </div>

            <div>
              <h3 className="text-[15px] font-bold leading-tight">
                AI Assistant
              </h3>
              <p className="text-xs text-blue-100">
                Tư vấn thuê xe điện thông minh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={startNewConversation}
              title="Chat mới"
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15"
            >
              <MdRefresh className="text-xl" />
            </button>

            <button
              onClick={onClose}
              title="Đóng"
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15"
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-[430px] overflow-y-auto bg-[#f8fbff] px-4 py-4 custom-chat-scroll">
        <div className="space-y-3">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <MdSmartToy className="text-lg" />
                  </div>
                )}

                <div className="max-w-[82%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-[14px] leading-7 tracking-[0.01em] shadow-sm ${
                      isUser
                        ? "rounded-br-md bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                        : "rounded-bl-md border border-sky-100 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-line break-words font-normal text-[14px] leading-7">
                      {msg.content}
                    </p>
                  </div>

                  {!isUser ? renderVehicleCards(msg.vehicles, msg.context) : null}
                </div>
              </div>
            );
          })}

          {(loading || bootstrapping) && (
            <div className="flex justify-start">
              <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <MdSmartToy className="text-lg" />
              </div>

              <div className="rounded-2xl rounded-bl-md border border-sky-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                {bootstrapping ? "Đang khởi tạo chat..." : "AI đang trả lời..."}
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {["Xe 4 người", "Xe 7 chỗ", "SUV", "Đi Nha Trang 3 ngày"].map(
            (chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600 hover:bg-sky-100"
              >
                {chip}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-3 rounded-full border border-sky-100 bg-slate-50 px-3 py-2">
          <input
            className="flex-1 bg-transparent px-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Hỏi về thuê xe, giá, loại xe phù hợp..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || bootstrapping}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md transition hover:scale-105 hover:from-sky-600 hover:to-blue-700 disabled:opacity-60"
          >
            <MdSend className="text-xl" />
          </button>
        </div>
      </div>

      <style>{`
        .custom-chat-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .custom-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 999px;
        }

        .custom-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
    </div>,
    document.body
  );
}

ChatWidget.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};