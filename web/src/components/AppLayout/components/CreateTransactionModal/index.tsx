import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  title: string,
  description: string,
  amount: number,
}

const CreateTransactionModal: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = data => console.log(data);
  console.log(watch("title"))

  return (
    <dialog id="create_transaction_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-5">New Transaction</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-control w-full max-w-xs mb-3">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select className="select select-bordered w-full max-w-xs">
              <option>Category 1</option>
              <option>Category 2</option>
              <option>Category 3</option>
            </select>
          </div>
          <div className="form-control w-full max-w-xs mb-3">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input className="input input-bordered w-full max-w-xs" placeholder="Bulgari" {...register("title", { required: true })} />
          </div>
          <div className="form-control w-full max-w-xs mb-3">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea className="textarea textarea-bordered w-full h-24" placeholder="Birthday Present..." {...register("description")} />
          </div>
          <div className="form-control w-full max-w-xs mb-3">
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <input className="input input-bordered w-full max-w-xs" type="number" {...register("amount", { required: true })} />
            {errors.amount && <span className="text-error">This field is required</span>}
          </div>
          <div className="modal-action flex items-center justify-center gap-5">
            <div
              onClick={() => {
                if (document) {
                  (document.getElementById("create_transaction_modal") as HTMLFormElement).showModal();
                }
              }}
            >
              <button className="btn">Close</button>
            </div>
            <input className="btn btn-primary" type="submit" value="submit" />
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default CreateTransactionModal;
