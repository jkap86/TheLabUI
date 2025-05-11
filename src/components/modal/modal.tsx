import { JSX, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./modal.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const modalRoot =
    typeof window !== "undefined"
      ? document.getElementById("modal-root")
      : null;

  // create container once
  if (!elRef.current) {
    elRef.current = document.createElement("div");
  }

  // mount/unmount to modal-root
  useEffect(() => {
    if (isOpen && modalRoot && elRef.current) {
      modalRoot.appendChild(elRef.current);
      return () => {
        modalRoot.removeChild(elRef.current!);
      };
    }
  }, [isOpen, modalRoot]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>,
    elRef.current
  );
};

export default Modal;
