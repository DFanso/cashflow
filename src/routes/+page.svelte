<h1>Welcome to SvelteKit</h1>
<script lang="ts">
  import IncomeForm from '$lib/components/IncomeForm.svelte';
  import ExpenseForm from '$lib/components/ExpenseForm.svelte';
  import SavingsForm from '$lib/components/SavingsForm.svelte';
  import type { Income } from '$lib/models/income';
  import type { Expense } from '$lib/models/expense';
  import type { Savings } from '$lib/models/savings';
  import './+page.svelte.css';

  let incomes: Income[] = [];
  let expenses: Expense[] = [];
  let savings: Savings[] = [];

  const handleIncomeSubmit = (event: CustomEvent<Income>) => {
    incomes = [...incomes, event.detail];
  };

  const handleExpenseSubmit = (event: CustomEvent<Expense>) => {
    expenses = [...expenses, event.detail];
  };

  const handleSavingsSubmit = (event: CustomEvent<Savings>) => {
    savings = [...savings, event.detail];
  };
</script>

<h1>Cashflow Tracker</h1>

<IncomeForm on:submit={handleIncomeSubmit} />
<ExpenseForm on:submit={handleExpenseSubmit} />
<SavingsForm on:submit={handleSavingsSubmit} />

<h2>Incomes</h2>
{#each incomes as income}
  <p>{income.name}: {income.amount}</p>
{/each}

<h2>Expenses</h2>
{#each expenses as expense}
  <p>{expense.name}: {expense.amount}</p>
{/each}

<h2>Savings</h2>
{#each savings as saving}
  <p>{saving.name}: {saving.amount}</p>
{/each}

<h2>Total Income: ${incomes.reduce((acc, income) => acc + income.amount, 0)}</h2>
<h2>Total Expenses: ${expenses.reduce((acc, expense) => acc + expense.amount, 0)}</h2>
<h2>Total Savings: ${savings.reduce((acc, saving) => acc + saving.amount, 0)}</h2>
<h2>Available Funds: ${incomes.reduce((acc, income) => acc + income.amount, 0) - expenses.reduce((acc, expense) => acc + expense.amount, 0) + savings.reduce((acc, saving) => acc + saving.amount, 0)}</h2>
