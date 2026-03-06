import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MdElectricCar,
  MdVerifiedUser,
  MdSupportAgent,
  MdSpeed,
  MdStar,
  MdArrowForward,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdAutoAwesome,
  MdGroups,
  MdEmojiEvents,
  MdShield,
  MdBolt,
  MdHandshake,
  MdTrendingUp,
  MdPlayCircle,
} from "react-icons/md";

import heroVideo from "../../assets/videos/HomeVideo.mp4";
import storyImg from "../../assets/images/home1.jpg";

// ---- scroll-reveal hook ----
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ---- animated number counter ----
function Counter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return (
    <span ref={ref}>
      {count.toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
}

// ---- data ----
const STATS = [
  {
    icon: MdGroups,
    label: "Khach hang tin tuong",
    labelVi: "Khách hàng tin tưởng",
    value: 12000,
    suffix: "+",
    color: "text-sky-500",
    bg: "bg-sky-50",
  },
  {
    icon: MdElectricCar,
    label: "Xe dien san sang",
    labelVi: "Xe điện sẵn sàng",
    value: 320,
    suffix: "+",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: MdEmojiEvents,
    label: "Chuyen di thanh cong",
    labelVi: "Chuyến đi thành công",
    value: 85000,
    suffix: "+",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: MdTrendingUp,
    label: "Tang truong",
    labelVi: "Tăng trưởng YoY",
    value: 340,
    suffix: "%",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
];

const FEATURES = [
  {
    icon: MdBolt,
    title: "100% Xe Điện",
    desc: "Toàn bộ đội xe EV hiện đại, êm ái và thân thiện môi trường.",
    iconBg: "bg-sky-100 text-sky-500",
  },
  {
    icon: MdShield,
    title: "An Toàn Tuyệt Đối",
    desc: "Mỗi xe kiểm định kỹ lưỡng, bảo hiểm toàn diện, tài xế chứng chỉ quốc tế.",
    iconBg: "bg-emerald-100 text-emerald-500",
  },
  {
    icon: MdHandshake,
    title: "Minh Bạch 100%",
    desc: "Không phí ẩn, giá hiển thị trước khi xác nhận đặt xe.",
    iconBg: "bg-violet-100 text-violet-500",
  },
  {
    icon: MdSupportAgent,
    title: "Hỗ Trợ 24/7",
    desc: "Đội ngũ hỗ trợ trực tuyến mọi lúc qua điện thoại, chat, email.",
    iconBg: "bg-amber-100 text-amber-500",
  },
  {
    icon: MdSpeed,
    title: "Đặt Xe 60 Giây",
    desc: "Giao diện AI gợi ý thông minh, quy trình đặt xe nhanh nhất thị trường.",
    iconBg: "bg-pink-100 text-pink-500",
  },
  {
    icon: MdAutoAwesome,
    title: "Trải Nghiệm Thông Minh",
    desc: "Hệ thống tự nhắc lịch, theo dõi hành trình, cá nhân hóa từng khách hàng.",
    iconBg: "bg-teal-100 text-teal-500",
  },
];

const TEAM = [
  {
    name: "Nguyễn Văn Minh",
    role: "CEO & Co-Founder",
    desc: "10+ năm kinh nghiệm vận tải & công nghệ",
    img: "https://i.pravatar.cc/150?img=11",
    color: "border-sky-200",
  },
  {
    name: "Trần Thị Lan",
    role: "CTO",
    desc: "Chuyên gia AI & hệ thống quản lý xe tự động",
    img: "https://i.pravatar.cc/150?img=5",
    color: "border-violet-200",
  },
  {
    name: "Lê Hoàng Nam",
    role: "Head of Operations",
    desc: "Điều phối mạng lưới 15 tỉnh thành",
    img: "https://i.pravatar.cc/150?img=15",
    color: "border-emerald-200",
  },
  {
    name: "Phạm Thu Hà",
    role: "Customer Success",
    desc: "Đảm bảo mỗi hành trình là hoàn hảo",
    img: "https://i.pravatar.cc/150?img=9",
    color: "border-amber-200",
  },
];

const TIMELINE = [
  { year: "2021", title: "Khởi Đầu", desc: "10 xe điện đầu tiên ra mắt tại TP.HCM." },
  { year: "2022", title: "Mở Rộng", desc: "Phủ sóng Hà Nội & Đà Nẵng, 100 xe." },
  { year: "2023", title: "Đột Phá", desc: "Ra mắt AI booking, 5.000 khách hàng." },
  { year: "2024", title: "Tăng Tốc", desc: "200+ xe, 10 tỉnh thành, giải Startup Xanh." },
  { year: "2025", title: "Toàn Quốc", desc: "15 tỉnh, 320+ xe, 85k chuyến an toàn." },
  { year: "2026", title: "Tương Lai", desc: "Mục tiêu 1.000 xe & Đông Nam Á." },
];

const REVIEWS = [
  {
    name: "Anh Tuấn – TP.HCM",
    text: "Xe sạch, đúng giờ, tài xế thân thiện. Đã book lần thứ 5 và chưa lần nào thất vọng!",
    img: "https://i.pravatar.cc/80?img=3",
  },
  {
    name: "Chị Mỹ Linh – Hà Nội",
    text: "Đặt xe cực dễ, 3 phút là xong. Hệ thống tự nhắc nhở rất tiện, sẽ giới thiệu cho bạn bè!",
    img: "https://i.pravatar.cc/80?img=25",
  },
  {
    name: "Anh Phong – Đà Nẵng",
    text: "Xe điện êm và mát, không lo ô nhiễm. Giá rẻ hơn taxi mà chất lượng vượt trội.",
    img: "https://i.pravatar.cc/80?img=7",
  },
];

// =============================================
export default function About() {
  const [videoRef] = useState(() => ({ current: null }));
  const [heroLoaded, setHeroLoaded] = useState(false);

  const [statsRef, statsInView] = useInView(0.1);
  const [storyTextRef, storyTextInView] = useInView(0.1);
  const [storyImgRef, storyImgInView] = useInView(0.1);
  const [featRef, featInView] = useInView(0.05);
  const [tlRef, tlInView] = useInView(0.05);
  const [teamRef, teamInView] = useInView(0.05);
  const [revRef, revInView] = useInView(0.05);
  const [ctaRef, ctaInView] = useInView(0.1);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden pt-16">

      {/* ==== HERO - same pattern as Homepage ==== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            ref={videoRef}
            className="w-full h-full object-cover scale-105"
            style={{ animation: "slowZoom 20s ease-in-out infinite alternate" }}
            src={heroVideo}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        </div>

        {/* Hero content */}
        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20"
          style={{
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 1s ease, transform 1s ease",
          }}
        >
          <span className="inline-block px-4 py-1.5 rounded-md bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest mb-8">
            Về EV Rental System
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-8 tracking-tight text-white">
            Chúng tôi
            <br />
            <span className="text-sky-400">định nghĩa lại</span>
            <br />
            trải nghiệm thuê xe
          </h1>

          <p className="text-lg lg:text-xl text-white/70 max-w-xl font-light leading-relaxed mb-10">
            Từ ý tưởng táo bạo đến nền tảng thuê xe điện hàng đầu Việt Nam — chúng tôi mang đến sự tiện lợi, bền vững và trải nghiệm thật sự đỉnh cao.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/booking"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sky-400/50"
            >
              Đặt xe ngay
              <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#story"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              <MdPlayCircle className="text-xl" />
              Câu chuyện của chúng tôi
            </a>
          </div>

          {/* Trusted by */}
          <div className="flex items-center gap-4 mt-12">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((n) => (
                <img
                  key={n}
                  src={`https://i.pravatar.cc/40?img=${n}`}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white">
                +2K
              </div>
            </div>
            <p className="text-sm text-white/70 font-medium">
              Được tin tưởng bởi hơn 2,000 khách hàng
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs animate-bounce">
          <span>Cuộn xuống</span>
          <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2.5 bg-sky-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* ==== STATS ==== */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div
          ref={statsRef}
          className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map(({ icon: Icon, labelVi, value, suffix, color, bg }, i) => (
            <div
              key={labelVi}
              className="group bg-white rounded-[2rem] p-8 border border-gray-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-500 hover:-translate-y-2 text-center"
              style={{
                opacity: statsInView ? 1 : 0,
                transform: statsInView ? "translateY(0)" : "translateY(32px)",
                transition: `opacity .7s ease ${i * 0.1}s, transform .7s ease ${i * 0.1}s`,
              }}
            >
              <div
                className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`text-2xl ${color}`} />
              </div>
              <div className={`text-4xl font-black ${color} mb-1`}>
                <Counter end={value} suffix={suffix} />
              </div>
              <p className="text-gray-500 text-sm font-medium">{labelVi}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==== STORY ==== */}
      <section id="story" className="py-28 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text */}
          <div
            ref={storyTextRef}
            style={{
              opacity: storyTextInView ? 1 : 0,
              transform: storyTextInView ? "translateX(0)" : "translateX(-40px)",
              transition: "opacity .8s ease, transform .8s ease",
            }}
          >
            <span className="inline-block px-4 py-1.5 rounded-md bg-sky-500 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
              Câu chuyện của chúng tôi
            </span>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6 tracking-tight">
              Tại sao chúng tôi{" "}
              <span className="text-sky-500">chọn xe điện?</span>
            </h2>
            <div className="space-y-4 text-gray-500 leading-relaxed text-base font-light">
              <p>
                Năm 2021, nhóm sáng lập nhận ra Việt Nam đang đứng trước cơ hội vàng để dẫn đầu cuộc cách mạng giao thông xanh tại Đông Nam Á.
              </p>
              <p>
                Thay vì chỉ cho thuê phương tiện, chúng tôi xây dựng một hệ sinh thái — từ đội xe điện hiện đại, nền tảng AI thông minh, đến mạng lưới hỗ trợ 24/7 — tất cả hướng đến mục tiêu:{" "}
                <strong className="text-gray-900 font-bold">mỗi chuyến đi là trải nghiệm đáng nhớ</strong>.
              </p>
              <p>
                Chúng tôi tin di chuyển bền vững không có nghĩa là hi sinh sự tiện nghi. EV Rental là bằng chứng sống động cho điều đó.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {["Bền vững", "Đổi mới", "Tin cậy", "Tiện lợi"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-sky-50 border border-sky-100 text-sky-600 text-sm font-semibold rounded-xl hover:bg-sky-100 transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              {[["0đ", "Phí ẩn"], ["24/7", "Hỗ trợ"], ["5★", "Chất lượng"]].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div className="text-2xl font-black text-sky-500">{v}</div>
                  <div className="text-gray-400 text-xs mt-0.5 font-medium">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div
            ref={storyImgRef}
            style={{
              opacity: storyImgInView ? 1 : 0,
              transform: storyImgInView ? "translateX(0)" : "translateX(40px)",
              transition: "opacity .8s ease .15s, transform .8s ease .15s",
            }}
          >
            <div className="relative">
              <img
                src={storyImg}
                alt="EV Rental Story"
                className="w-full rounded-[2.5rem] object-cover shadow-2xl shadow-sky-100/50"
                style={{ aspectRatio: "4/3" }}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
                  <MdElectricCar className="text-white text-2xl" />
                </div>
                <div>
                  <div className="font-black text-gray-900 text-base">320+ Xe Điện</div>
                  <div className="text-gray-400 text-xs font-medium">Sẵn sàng phục vụ</div>
                </div>
              </div>
              {/* Floating verified */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <MdVerifiedUser className="text-emerald-500 text-xl" />
                  <span className="text-xs font-bold text-gray-700">Kiểm định 100%</span>
                </div>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <MdStar key={i} className="text-amber-400 text-xs" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==== FEATURES ==== */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={featRef}
            className="text-center mb-16"
            style={{
              opacity: featInView ? 1 : 0,
              transform: featInView ? "translateY(0)" : "translateY(24px)",
              transition: "opacity .7s ease, transform .7s ease",
            }}
          >
            <span className="inline-block px-4 py-1.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
              Tại sao chọn chúng tôi
            </span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Những điều{" "}
              <span className="text-emerald-500">tạo nên khác biệt</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, iconBg }, i) => (
              <div
                key={title}
                className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-sky-200 hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-500 hover:-translate-y-2"
                style={{
                  opacity: featInView ? 1 : 0,
                  transform: featInView ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity .7s ease ${i * 0.08}s, transform .7s ease ${i * 0.08}s`,
                }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  <Icon className="text-3xl" />
                </div>
                <h3 className="font-extrabold text-xl mb-4 group-hover:text-sky-600 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-light group-hover:text-gray-700 transition-colors duration-300">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==== TIMELINE ==== */}
      <section className="py-28 max-w-5xl mx-auto px-6">
        <div
          ref={tlRef}
          className="text-center mb-20"
          style={{
            opacity: tlInView ? 1 : 0,
            transform: tlInView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity .7s ease, transform .7s ease",
          }}
        >
          <span className="inline-block px-4 py-1.5 rounded-md bg-violet-500 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
            Hành Trình
          </span>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
            Từng <span className="text-violet-500">bước tiến</span>
          </h2>
        </div>

        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent -translate-x-1/2 hidden md:block" />

          <div className="space-y-8">
            {TIMELINE.map(({ year, title, desc }, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={year}
                  className="flex items-center gap-0 md:gap-8"
                  style={{
                    flexDirection: isLeft ? undefined : "row-reverse",
                    opacity: tlInView ? 1 : 0,
                    transform: tlInView ? "translateY(0)" : "translateY(28px)",
                    transition: `opacity .6s ease ${i * 0.1}s, transform .6s ease ${i * 0.1}s`,
                  }}
                >
                  <div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}>
                    <div className="inline-block bg-white rounded-2xl p-6 border border-gray-100 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all duration-300 hover:-translate-y-1">
                      <div className="text-sky-500 text-xs font-bold font-mono mb-1">{year}</div>
                      <div className="text-gray-900 font-extrabold text-base mb-1">{title}</div>
                      <div className="text-gray-400 text-sm font-light">{desc}</div>
                    </div>
                  </div>
                  <div className="relative z-10 shrink-0 hidden md:block">
                    <div className="w-4 h-4 rounded-full bg-sky-500 ring-4 ring-sky-100 shadow-md" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==== TEAM ==== */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={teamRef}
            className="text-center mb-16"
            style={{
              opacity: teamInView ? 1 : 0,
              transform: teamInView ? "translateY(0)" : "translateY(24px)",
              transition: "opacity .7s ease, transform .7s ease",
            }}
          >
            <span className="inline-block px-4 py-1.5 rounded-md bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest mb-4">
              Con Người
            </span>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Đội ngũ{" "}
              <span className="text-amber-500">đằng sau sứ mệnh</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(({ name, role, desc, img, color }, i) => (
              <div
                key={name}
                className={`group bg-white rounded-[2.5rem] p-8 border-2 ${color} hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-500 hover:-translate-y-2 text-center`}
                style={{
                  opacity: teamInView ? 1 : 0,
                  transform: teamInView ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity .7s ease ${i * 0.1}s, transform .7s ease ${i * 0.1}s`,
                }}
              >
                <div className="relative inline-block mb-6">
                  <img
                    src={img}
                    alt={name}
                    className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center shadow-md">
                    <MdStar className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="font-extrabold text-gray-900 text-base">{name}</h3>
                <p className="text-sky-500 text-xs font-bold mt-0.5 mb-3">{role}</p>
                <p className="text-gray-400 text-xs font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==== REVIEWS ==== */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={revRef}
          className="text-center mb-16"
          style={{
            opacity: revInView ? 1 : 0,
            transform: revInView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity .7s ease, transform .7s ease",
          }}
        >
          <span className="inline-block px-4 py-1.5 rounded-md bg-pink-500 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
            Khách Hàng Nói Gì
          </span>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
            Hàng ngàn{" "}
            <span className="text-pink-500">trải nghiệm</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map(({ name, text, img }, i) => (
            <div
              key={name}
              className="bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-50 transition-all duration-500 hover:-translate-y-2"
              style={{
                opacity: revInView ? 1 : 0,
                transform: revInView ? "translateY(0)" : "translateY(32px)",
                transition: `opacity .7s ease ${i * 0.12}s, transform .7s ease ${i * 0.12}s`,
              }}
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <MdStar key={j} className="text-amber-400 text-sm" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic font-light">
                "{text}"
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <img
                  src={img}
                  alt={name}
                  className="w-11 h-11 rounded-xl object-cover"
                />
                <span className="text-gray-700 text-sm font-semibold">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== CTA ==== */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div
          ref={ctaRef}
          className="max-w-6xl mx-auto"
          style={{
            opacity: ctaInView ? 1 : 0,
            transform: ctaInView ? "translateY(0)" : "translateY(32px)",
            transition: "opacity .8s ease, transform .8s ease",
          }}
        >
          <div className="relative rounded-[3rem] overflow-hidden">
            {/* BG image with overlay */}
            <img
              src={storyImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-sky-900/75 to-blue-900/90" />

            <div className="relative z-10 p-10 md:p-16 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <span className="inline-block px-4 py-1.5 rounded-md bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                  Liên Hệ
                </span>
                <h2 className="text-4xl font-black mb-6 leading-tight">
                  Chúng tôi luôn{" "}
                  <span className="text-sky-300">ở đây</span>
                </h2>
                <div className="space-y-4">
                  {[
                    { Icon: MdLocationOn, text: "123 Nguyễn Huệ, Q.Bình Thạnh, TP.HCM" },
                    { Icon: MdPhone, text: "1800 1234 (Miễn phí · 24/7)" },
                    { Icon: MdEmail, text: "support@evrental.vn" },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-start gap-3 text-white/80">
                      <Icon className="text-sky-300 text-xl shrink-0 mt-0.5" />
                      <span className="text-sm font-light">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-white/70 mb-8 text-sm leading-relaxed font-light">
                  Sẵn sàng trải nghiệm tương lai của việc di chuyển?
                  <br />
                  Đặt xe đầu tiên của bạn ngay hôm nay.
                </p>
                <Link
                  to="/booking"
                  className="group inline-flex items-center gap-2 px-9 py-4 bg-white text-sky-600 font-extrabold rounded-2xl shadow-xl hover:bg-sky-50 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Đặt xe ngay
                  <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-white/40 text-xs mt-4">Không cần đặt cọc cho lần đầu tiên</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
