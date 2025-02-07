<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let name = '';
  let amount = 0;
  let date = new Date().toISOString().slice(0, 10);

  const handleSubmit = () => {
    dispatch('submit', {
      name,
      amount: +amount,
      date: new Date(date),
    });
    name = '';
    amount = 0;
    date = new Date().toISOString().slice(0, 10);
  };
</script>

<form on:submit|preventDefault={handleSubmit}>
  <label for="name">Name:</label>
  <input type="text" id="name" bind:value={name} />

  <label for="amount">Amount:</label>
  <input type="number" id="amount" bind:value={amount} />

  <label for="date">Date:</label>
  <input type="date" id="date" bind:value={date} />

  <button type="submit">Add Income</button>
</form>
