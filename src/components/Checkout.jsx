import Modal from "./Modal";
import { useActionState, useContext } from "react";
import UserProgressContext from "../store/UserProgressContext";
import Input from "./Input.jsx";
import useHttp from "./useHttp.jsx";



export default function Checkout() {
   
  const userProgressContext = useContext(UserProgressContext);

  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  const { data, error, refetch, clearData } = useHttp(
    "/api/orders",
    requestConfig
  );
  async function checkoutAction(prevState, formData){
    const userData = Object.fromEntries(formData.entries());
    console.log("User Data:", userData);
    await refetch(
      {customer: userData}
    );
    return null;
  }
  const [formState, formAction, isSending ] = useActionState(checkoutAction, null);


  function handleFinish() {
    userProgressContext.hideCheckout();
    clearData(); // Clear the data from the previous order
    
  }

  if (data && !error){
    return(
        <Modal 
            open={userProgressContext.progress === "checkout"}
            onClose={userProgressContext.hideCheckout}
        >
        <h2></h2>
        <p>Form Submitted!!</p>
        <button onClick={handleFinish}>Close</button>
        </Modal>

    )
  }
  let actions = (
    <>
      <button type="button" onClick={userProgressContext.hideCheckout}>Close</button>
      <button>Submit</button>
    </>
  )

  if(isSending){
    actions = <p className="center">Sending order data...</p>;
  }


  return (
    <Modal
      open={userProgressContext.progress === "checkout"}
      onClose={handleFinish}
      
    >
      <form action={formAction}>
        <h2>Enquiry Form</h2>
        <p>Contact No: 9822646823</p>
        <p>Please fill your details below:</p>
        <Input
          label="Your Name"
          type="text"
          id="name"
           
        />
        <Input
          label="Email Address"
          type="email"
          id="email"
           
        />
        <Input
          label="Street Address"
          type="text"
          id="street"
           
        />
        <Input
              label="Enter Mobile Number"
              type="text"
              id="mobile"
            />
        <div className="control-row">
            <Input
              label="City"
              type="text"
              id="city"
               
            />
            <Input
              label="Postal Code"
              type="text"
              id="postal-code"
               
            />
            
        </div>

        <div className="modal-actions">
            {actions}
        </div>
      </form>
    </Modal>
  );
}
