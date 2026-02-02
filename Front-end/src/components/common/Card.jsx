import PropTypes from 'prop-types';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md p-6 transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
