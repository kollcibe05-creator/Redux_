import { useDispatch, useSelector } from "react-redux";

const {isOpen, message } = useSelector(state => state.ui.modal);
const dispatch = useDispatch()

if (!isOpen) return null;
return (
    <div className="modal-overlay">
        <div className="modal-content">
            <p>{message}</p>
            <button onClick={() => dispatch(closeModal())}>Close</button>
        </div>
    </div>
    
)


// in a robust setup html:
{/* <body>
    <div id="root"><div id="modal-root"></div></div> 
</body>     */}

// then the ModalRoot:
// import ReactDOM from "react-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { closeModal } from "./uiSlice";

// export const ModalRoot = () => {
//   const { isOpen, message, type } = useSelector((state) => state.ui.modal);
//   const dispatch = useDispatch();

//   if (!isOpen) return null;

//   // This "teleports" the JSX to the #modal-root div
//   return ReactDOM.createPortal(
//     <div className="modal-overlay">
//       <div className={`modal-content ${type}`}>
//         <h2>{type === 'error' ? 'Alert' : 'Success'}</h2>
//         <p>{message}</p>
//         <button onClick={() => dispatch(closeModal())}>OK</button>
//       </div>
//     </div>,
//     document.getElementById("modal-root")
//   );
// };