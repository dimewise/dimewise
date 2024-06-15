import { Navigate } from "react-router-dom";
import { Routes } from "../Routes";
import { useAuth } from "../hooks/useAuth";

export const Home = () => {
  const { session: authSession } = useAuth();

  if (authSession) {
    return (
      <Navigate
        to={Routes.Dashboard}
        replace
      />
    );
  }
  return (
    <div className="prose h-full w-full">
      <section className="mt-32 flex flex-col justify-center items-center text-center">
        <h1 className="mb-0 text-5xl">
          Budget with a <span className="text-primary underline decoration-solid">purpose</span> Count your dimes{" "}
          <span className="text-primary underline decoration-solid">wisely</span>
        </h1>
        <p className="">
          Dimewise is a financial tool that utilizes the "Envelope" system and "Zero-based" budgeting method to bring
          purpose to each dollar you spend. Create categories with ease and assign a monthly budget broken down to each
          category for your own clarity.
        </p>
        <div className="flex justify-center items-center gap-x-3 mt-5">
          <button
            type="button"
            className="btn btn-primary"
          >
            Get Started
          </button>
          <button
            type="button"
            className="btn btn-primary btn-outline"
          >
            Find out more
          </button>
        </div>
      </section>
    </div>
  );
};
