# DimeWise: Personalized Budgeting Redefined

Welcome to DimeWise, your go-to companion for personalized budgeting that takes a fresh approach to traditional methods, addressing the shortcomings of other budgeting apps that may not align with your unique needs. Designed around the financial habits of our team and heavily influenced by real-life experiences, DimeWise empowers users to seize control of their expenses by delving into detailed categories and descriptions.

## Features

- **Tailored Approach:** DimeWise is meticulously crafted based on real-life budgeting experiences, offering a personal touch to financial planning.

- **Category-Centric Planning:** DimeWise stands out by encouraging users to plan meticulously, breaking down expenses into distinct categories.

_Stay tuned for more exciting features..._

## Tech Stack

DimeWise leverages cutting-edge technologies:

- **Frontend:** Developed with SvelteKit for a responsive and dynamic interface, enhanced by the aesthetic appeal of TailwindCSS.

- **Database:** Powered by the robust combination of Supabase and Prisma (ORM), ensuring efficient data management and retrieval.

- **Authentication:** Secured by Supabase authentication to safeguard user information and maintain data integrity.

## Setting up the Local Environment

Follow these steps to set up the local environment for the DimeWise project:

1.  **Clone the Repository:**

    - Open your terminal.
    - Navigate to your desired directory.
    - Run the following command to clone the project:
      ```bash
      git clone [repository_url]
      ```

2.  **Install Dependencies:**

    - Change into the root directory of the project:
      ```bash
      cd dimewise
      ```
    - Run npm install to install project dependencies:
      ```bash
      npm install
      ```

3.  **Setup pre-commit and pre-push hooks:**

    - Run npm run setup:hooks to set up git hooks:
      ```bash
      npm run setup:hooks
      ```

4.  **Copy Environment Variables:**

    - Locate the `env.example` file in the root directory.
    - Create a copy of this file and rename it to `.env`.

5.  **Start Supabase Local Server:**

    - Ensure that Prisma and Supabase CLI are installed (**optional**: this should already be done with `npm install`):
      ```bash
      npm install -g prisma
      npm install -g supabase
      ```
    - Start the Supabase local server using the following command:

      ```bash
      npx supabase start
      ```

      Upon running the above command, it should show your supabase status information. Copy the values of `API URL` and `anon key` into the `.env` file created in step 4.

      **Note:** Ensure Docker is running, as this process requires it. If you lose the supabase status information, run `npm run db:status` or `npx supabase status` to display the information again.

6.  **Execute database migrations**:

    - Run the following command to apply database migrations:
      ```bash
      npx prisma migrate dev
      ```

Now, your local environment is set up and ready for development with DimeWise!

Feel free to reach out if you encounter any issues or have further questions. Happy coding!

## Getting Started

Experience the power of personalized budgeting with DimeWise. Take control of your financial journey, one category at a time.

[Explore DimeWise](#)

---

_DimeWise - Where Every Dime Counts._

```

```
