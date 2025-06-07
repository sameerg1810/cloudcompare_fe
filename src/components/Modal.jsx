import React from "react";

/**
 * A reusable Modal component.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be displayed inside the modal.
 * @param {function} props.onClose - Function to call when the modal is requested to be closed.
 */
const Modal = ({ children, onClose }) => {
  // Prevent clicks inside the modal content from closing the modal
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Allows clicking outside the modal content to close it
    >
      <div
        className="bg-space-medium rounded-lg p-6 shadow-glow max-w-lg w-full relative transform transition-all sm:my-8 sm:w-full"
        onClick={handleContentClick} // Prevent click from bubbling up to the overlay
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-darkPurple-900 hover:text-darkPurple-800 text-3xl font-bold leading-none"
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
