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
  useEffect(() => {
    if (!elRef.current) {
      elRef.current = document.createElement("div");
    }
  }, []);

  // Lock background scroll (no one‑way bounce) by using position:fixed
  useEffect(() => {
    if (!isOpen) return;

    // 1️⃣ Remember where we were
    const scrollY = window.scrollY;

    // 2️⃣ Fix the body in place
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      // 3️⃣ Unfix, restore original position
      document.body.style.position = "";
      document.body.style.top = "";
      // 4️⃣ Jump back to where you were
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // mount/unmount to modal-root
  useEffect(() => {
    if (isOpen && modalRoot && elRef.current) {
      modalRoot.appendChild(elRef.current);
      return () => {
        modalRoot.removeChild(elRef.current!);
      };
    }
  }, [isOpen, modalRoot]);

  if (!isOpen || !elRef.current) return null;

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
