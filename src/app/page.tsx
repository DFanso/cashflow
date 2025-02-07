
import AddIncomeForm from '@/components/AddIncomeForm';
import AddOutgoingForm from '@/components/AddOutgoingForm';
import AddSavingsForm from '@/components/AddSavingsForm';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Cashflow Tracker</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <AddIncomeForm />
        <AddOutgoingForm />
        <AddSavingsForm />
      </div>
    </div>
  );
}
