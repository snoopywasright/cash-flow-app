# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# **Event Cash Flow Analyzer**

A React-based financial simulation tool designed to model cash flow, capital outlay, and profitability for large-scale event management projects.

## **Overview**

This application simulates the financial lifecycle of \~22,000 events over a 5-year period (2026–2031). It helps project managers visualize **Peak Cash Outlay** (the maximum capital required to float costs) and **Net Profit** based on reimbursement delays and service fees.

### **Key Features**

* **Interactive Simulation:** Adjust reimbursement delays (30–150 days) and fee percentages (2–5%) to see real-time impacts on cash flow.  
* **Granular Cost Builder:** Define specific "Other Direct Costs" (ODC) per event type (Food, Lodging, A/V, etc.).  
* **Labor & Staffing Model:**  
  * Define roles, hourly rates, and headcounts.  
  * **Wrap Rate Support:** Apply multipliers (e.g., 1.2x) to labor costs for overhead/benefits.  
* **Smart Data Generation:**  
  * **Gaussian Distribution:** Applies realistic variance to event costs, labor hours, and payment delays (bell curve).  
  * **Event Mix:** Configure the ratio of Basic, Standard, and Specialized events.  
* **CSV Export:** Download the full synthesized dataset (\~22k rows) including granular cost breakdowns and assigned delay factors.

## **Financial Logic**

The simulation uses specific formulas to ensure accuracy in government/contracting contexts:

1. **Total Event Cost** \= Sum(ODC Components) \+ Total Labor Cost  
   * *Labor Cost* \= (Rate × Hours × Count) × Wrap Rate  
2. **Outflow** \= The company pays the **Total Event Cost** on Day 0 of the event.  
3. **Inflow (Reimbursement)** \= (Labor Cost \+ ODC Cost) \+ (ODC Cost × Fee %)  
   * *Note:* Labor is treated as a pass-through (reimbursed at cost). The Service Fee (Profit) is applied **only** to the ODC portion.  
4. **Reimbursement Timing:**  
   * Payment Day \= Event Day \+ Mean Delay ± Random Variance  
   * The delay follows a Gaussian distribution centered on the selected "Avg. Reimbursement Delay", meaning some payments arrive earlier or later than the average.

## **Getting Started**

### **Prerequisites**

* Node.js (v14 or higher)  
* npm (Node Package Manager)

### **Installation**

1. **Create the project:**  
   npm create vite@latest cash-flow-app \-- \--template react  
   cd cash-flow-app

2. **Install dependencies:**  
   npm install recharts lucide-react  
   npm install \-D tailwindcss postcss autoprefixer  
   npx tailwindcss init \-p

3. **Configure Tailwind (tailwind.config.js):**  
   export default {  
     content: \[  
       "./index.html",  
       "./src/\*\*/\*.{js,ts,jsx,tsx}",  
     \],  
     theme: {  
       extend: {},  
     },  
     plugins: \[\],  
   }

4. **Add Tailwind directives (src/index.css):**  
   @tailwind base;  
   @tailwind components;  
   @tailwind utilities;

5. **Add the Application Code:**  
   * Replace the contents of src/App.jsx with the provided CashFlowApp.jsx code.

### **Running the App**

npm run dev

Open your browser to http://localhost:5173 (or the port shown in your terminal).

## **Usage Guide**

1. **Analysis Tab:** Use the sliders to set your macro parameters (Volume, Delay, Fee).  
2. **Event Cost Builder:** Click this tab to define the ODC budget for your events (Food, Travel, etc.).  
3. **Labor & Staffing:** Click this tab to add team members. Ensure you set the **Wrap Rate** (default 1.0) to account for burden.  
4. **Update Model:** Click the "Update Model" button on the Builder or Labor tabs to re-run the simulation with your new costs.  
5. **Export:** On the Analysis tab, click "Export Simulation CSV" to get the raw data for Excel/Tableau.