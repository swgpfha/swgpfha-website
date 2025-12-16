// src/pages/Payment.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY!;
const API = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5050";
const IS_DEV = import.meta.env.DEV;
const TEST_MOMO = import.meta.env.VITE_PAYSTACK_TEST_MOMO || "233000000000";
const GET_INVOLVED_PATH = "/get-involved";

declare global { interface Window { PaystackPop: any } }

type DonationState = {
  amount: number;
  donor?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
} | null;

/* --------------------------- UI bits --------------------------- */
function Confetti() {
  const pieces = Array.from({ length: 60 });
  const colors = ["#16a34a","#22c55e","#10b981","#60a5fa","#f59e0b","#ef4444","#a855f7"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[60]">
      {pieces.map((_, i) => {
        const left = Math.random() * 100, delay = Math.random() * 1.5;
        const duration = 3 + Math.random() * 2, size = 6 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotate = Math.floor(Math.random() * 360);
        return (
          <span
            key={i}
            style={{
              left: `${left}vw`, top: `-10px`, width: size, height: size, background: color,
              animation: `fall ${duration}s linear ${delay}s forwards, spin ${duration}s linear ${delay}s`,
              transform: `rotate(${rotate}deg)`,
            }}
            className="absolute block rounded-sm"
          />
        );
      })}
      <style>{`
        @keyframes fall { to { transform: translateY(110vh); opacity: .9 } }
        @keyframes spin { to { transform: rotate(720deg) translateY(110vh) } }
      `}</style>
    </div>
  );
}

function SuccessOverlay({ onClose, secondsLeft }: { onClose: () => void; secondsLeft: number; }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-6">
      <Confetti />
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-green-600">
            <path fill="currentColor" d="M9.0 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.4-1.4z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Payment Complete</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Thank you for your support! Redirecting in <strong>{secondsLeft}</strong> seconds…
        </p>
        <Button className="w-full" onClick={onClose}>Go to Get Involved</Button>
      </div>
    </div>
  );
}
/* --------------------------- /UI bits --------------------------- */

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const donationData = (location.state as DonationState) || null;

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState<any>(null);
  const lastRef = useRef<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  const amountKobo = useMemo(
    () => Math.round((donationData?.amount || 0) * 100),
    [donationData?.amount]
  );

  useEffect(() => {
    if (window.PaystackPop) return;
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    if (!showSuccess) return;
    setSecondsLeft(30);
    const t = setTimeout(() => navigate(GET_INVOLVED_PATH, { replace: true }), 30_000);
    const i = setInterval(() => setSecondsLeft(s => (s > 1 ? s - 1 : 1)), 1000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [showSuccess, navigate]);

  const closeSuccess = () => {
    setShowSuccess(false);
    navigate(GET_INVOLVED_PATH, { replace: true });
  };

  const deriveNames = () => {
    let first = (donationData?.firstName || "").trim();
    let last  = (donationData?.lastName  || "").trim();
    if (!first || !last) {
      const donor = (donationData?.donor || "").trim();
      if (donor) {
        const parts = donor.split(/\s+/);
        if (!first && parts[0]) first = parts[0];
        const rest = parts.slice(1).join(" ");
        if (!last && rest) last = rest;
      }
    }
    if (!first) first = (donationData?.email || "").split("@")[0] || "Friend";
    if (!last)  last = "Donor";
    return { firstName: first, lastName: last };
  };

  const markSuccess = () => {
    setStatusText("Payment successful ✔");
    setLoading(false);
    setShowSuccess(true);
  };

  // robust verify handling multiple response shapes
  const verifyOnce = async (reference: string) => {
    try {
      const r = await fetch(`${API}/api/payments/verify-payment?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      setResult(data);

      const okFlag =
        Boolean((data && data.ok) ?? false) ||
        (typeof data?.status === "boolean" ? data.status : false);

      const tx =
        data?.data && typeof data.data === "object"
          ? data.data
          : data?.data?.data && typeof data.data.data === "object"
          ? data.data.data
          : undefined;

      const statusStr = String(tx?.status ?? "").toLowerCase();
      const gateway   = String(tx?.gateway_response ?? "").toLowerCase();

      if (okFlag || statusStr === "success" || gateway.includes("approved") || gateway.includes("successful") || gateway.includes("completed")) {
        markSuccess();
        return true;
      }
      if (statusStr === "failed" || statusStr === "reversed" || statusStr === "abandoned") {
        setStatusText("Payment failed ✖");
        setLoading(false);
        return true;
      }
      return false;
    } catch {
      setStatusText("Could not verify payment. Retrying…");
      return false;
    }
  };

  const pollVerify = async (reference: string) => {
    setStatusText("Processing… waiting for confirmation");
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      const done = await verifyOnce(reference);
      if (done) return;
      await new Promise(r => setTimeout(r, 3000));
    }
    setStatusText("Still processing. We’ll update this once Paystack confirms.");
    setLoading(false);
  };

  const onPaystackSuccess = (resp: { reference: string }) => {
    lastRef.current = resp.reference;
    setStatusText("Verifying payment…");
    verifyOnce(resp.reference).then(done => { if (!done) pollVerify(resp.reference); });
  };

  const onPaystackClose = () => {
    if (!lastRef.current) {
      setStatusText("Payment cancelled.");
      setLoading(false);
    }
  };

  const startPaystack = (method: "momo" | "card") => {
    if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
      alert("Payment library not ready yet");
      return;
    }
    const email = donationData?.email || "";
    if (!email) { alert("Missing email from donation form."); return; }

    const { firstName, lastName } = deriveNames();
    setLoading(true);
    setResult(null);
    setStatusText("Initializing payment…");

    const handler = window.PaystackPop.setup({
      key: PUBLIC_KEY,
      email,
      amount: amountKobo,
      currency: "GHS",
      channels: method === "card" ? ["card", "bank_transfer"] : ["mobile_money"],
      firstname: firstName,
      lastname: lastName,
      metadata: {
        custom_fields: [
          { display_name: "Donor", variable_name: "donor", value: donationData?.donor || "Anonymous" },
          { display_name: "First Name", variable_name: "first_name", value: firstName },
          { display_name: "Last Name", variable_name: "last_name", value: lastName },
          ...(method === "momo" && IS_DEV ? [{ display_name: "Phone", variable_name: "msisdn", value: TEST_MOMO }] : []),
          { display_name: "Method", variable_name: "method", value: method },
        ],
      },
      callback: onPaystackSuccess,
      onClose: onPaystackClose,
    });

    if (handler && typeof handler.openIframe === "function") handler.openIframe();
    else {
      setLoading(false);
      setStatusText("Could not initialize payment (handler missing).");
    }
  };

  return (
    <>
      {showSuccess && <SuccessOverlay onClose={closeSuccess} secondsLeft={secondsLeft} />}

      <div className="min-h-screen bg-muted flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Choose Payment Method</CardTitle>
            {donationData?.amount && (
              <p className="text-sm text-muted-foreground">
                {donationData?.donor ? `${donationData.donor}, ` : ""}
                you are donating: <strong className="text-green-600">GHC{donationData.amount}</strong>
              </p>
            )}
            {donationData?.email && (
              <p className="text-xs text-muted-foreground mt-1">{donationData.email}</p>
            )}
          </CardHeader>

          <CardContent className="grid gap-3">
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
              onClick={() => startPaystack("momo")}
              disabled={loading}
              data-testid="btn-momo"
            >
              Pay with Paystack (MoMo, AirtelTigo, Telecel)
            </Button>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => startPaystack("card")}
              disabled={loading}
              data-testid="btn-card"
            >
              Pay with Card / Bank
            </Button>

            {statusText && <p className="text-sm text-muted-foreground">{statusText}</p>}

            {/* DEV-ONLY DEBUG, hidden during success overlay */}
            {IS_DEV && result && !showSuccess && (
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Debug response (dev only)
                </summary>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Payment;
