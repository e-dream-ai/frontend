import ModalContext from "@/context/modal.context";
import { useContext } from "react";

export const useModal = () => useContext(ModalContext);

export default useModal;
