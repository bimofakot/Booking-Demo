import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { authService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const { user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      await authService.resetPassword(identifier);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses permintaan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Lupa password"
      description="Masukkan username atau email yang terdaftar."
      footer={
        <>
          Ingat password?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-700 hover:underline dark:text-brand-300"
          >
            Kembali ke halaman masuk
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <MailCheck className="h-6 w-6" />
          </span>
          <Alert tone="success" title="Permintaan diterima">
            Jika akun dengan username atau email tersebut terdaftar, instruksi reset password
            akan dikirim. Pada mode demo lokal, tidak ada email yang benar-benar dikirim.
          </Alert>
          <Link to="/login" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke halaman masuk
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Username atau email" htmlFor="identifier">
            <input
              id="identifier"
              name="identifier"
              autoComplete="username"
              autoFocus
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="mis. budi atau budi@email.com"
              className={inputClasses}
            />
          </FormField>

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Memproses...' : 'Kirim instruksi reset'}
          </Button>

          <p className="text-[11px] leading-relaxed text-slate-400">
            Mode demo: permintaan hanya menampilkan pesan sukses. Implementasi Firebase nanti
            akan memakai fitur reset password bawaan autentikasi.
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
