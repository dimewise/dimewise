# Setting up the Local Environment

Follow these steps to set up the local environment for the DimeWise project:

1. **Clone the Repository:**

   - Open your terminal.
   - Navigate to your desired directory.
   - Run the following command to clone the project:
     ```bash
     git clone [repository_url]
     ```

2. **Install Dependencies:**

   - Change into the root directory of the project:
     ```bash
     cd dimewise
     ```
   - Run npm install to install project dependencies:
     ```bash
     npm install
     ```

3. **Copy Environment Variables:**

   - Locate the `env.example` file in the root directory.
   - Create a copy of this file and rename it to `.env`.

4. **Start Supabase Local Server:**
   - Ensure that Prisma and Supabase CLI are installed (**optional**: this should already be done with `npm install`):
     ```bash
     npm install -g prisma
     npm install -g supabase
     ```
   - Start the Supabase local server using the following command:
     ```bash
     npx supabase start
     ```
     **Note:** Make sure Docker is running as this process requires it.

Now, your local environment is set up and ready for development with DimeWise!

Feel free to reach out if you encounter any issues or have further questions. Happy coding!
