import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY!;
const API = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5050";
const IS_DEV = import.meta.env.DEV;
const TEST_MOMO = import.meta.env.VITE_PAYSTACK_TEST_MOMO || "233000000000"; // dev fallback

declare global {
  interface Window {
    PaystackPop: any;
  }
}

type PayMethod = "momo" | "card";

type StateIn =
  | {
      amount: number;
      donor?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      method?: PayMethod;
    }
  | null;

export default function PaymentPaystack() {
  const location = useLocation();
  const state = (location.state as StateIn) || { amount: 0 };
  const method: PayMethod = (state?.method as PayMethod) || "card";

  const [firstName, setFirstName] = useState<string>(state?.firstName || "");
  const [lastName, setLastName] = useState<string>(state?.lastName || "");
  const [email, setEmail] = useState<string>(state?.email || "");
  const [msisdn, setMsisdn] = useState<string>(""); // MoMo phone when method === 'momo'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [statusText, setStatusText] = useState<string>("");

  const lastRef = useRef<string | null>(null);

  const amountKobo = useMemo(
    () => Math.round((state?.amount || 0) * 100),
    [state?.amount]
  );

  // Load Paystack inline script once
  useEffect(() => {
    if (window.PaystackPop) return;
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const needsPhone = method === "momo";

  // In dev, auto-use test number for MoMo
  useEffect(() => {
    if (needsPhone && IS_DEV) setMsisdn(TEST_MOMO);
  }, [needsPhone]);

  const channels = useMemo(
    () => (method === "card" ? ["card", "bank_transfer"] : ["mobile_money"]),
    [method]
  );

  const heading = useMemo(
    () =>
      method === "momo"
        ? "Pay with Paystack (MoMo, AirtelTigo, Telecel)"
        : "Pay with Card / Bank",
    [method]
  );

  const btnText = useMemo(
    () => (method === "momo" ? "Pay Now (MoMo)" : "Pay Now (Card / Bank)"),
    [method]
  );

  // ---- verify helpers
  const verifyOnce = async (reference: string) => {
    const r = await fetch(
      `${API}/api/payments/verify-payment?reference=${reference}`
    );
    const data = await r.json();
    setResult(data);

    const tx = data?.data;
    const s = String(tx?.status || "").toLowerCase();
    const gw = String(tx?.gateway_response || "").toLowerCase();

    if (
      data?.ok ||
      s === "success" ||
      gw.includes("approved") ||
      gw.includes("successful") ||
      gw.includes("completed")
    ) {
      setStatusText("Payment successful ✔");
      setLoading(false);
      return true;
    }
    if (s === "failed" || s === "reversed") {
      setStatusText("Payment failed ✖");
      setLoading(false);
      return true;
    }
    return false;
  };

  const pollVerify = async (reference: string) => {
    setStatusText("Processing… waiting for confirmation");
    const deadline = Date.now() + 90_000; // up to 90s
    while (Date.now() < deadline) {
      const done = await verifyOnce(reference);
      if (done) return;
      await new Promise((r) => setTimeout(r, 3000));
    }
    setStatusText("Still processing. We’ll update this once Paystack confirms.");
    setLoading(false);
  };

  // named, non-async callbacks to satisfy Paystack validator
  const onPaystackSuccess = (resp: { reference: string }) => {
    lastRef.current = resp.reference;
    setStatusText("Verifying payment…");
    verifyOnce(resp.reference).then((done) => {
      if (!done) pollVerify(resp.reference);
    });
  };

  const onPaystackClose = () => {
    if (!lastRef.current) {
      setStatusText("Payment cancelled.");
      setLoading(false);
    }
  };

  const startPayment = () => {
    if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
      alert("Payment library not ready yet");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      alert("Enter first and last name");
      return;
    }
    if (!email) {
      alert("Email is required");
      return;
    }
    if (needsPhone && !msisdn) {
      alert("Enter mobile number (e.g. 23324xxxxxxx)");
      return;
    }

    setLoading(true);
    setResult(null);
    setStatusText("Initializing payment…");

    const handler = window.PaystackPop.setup({
      key: PUBLIC_KEY,
      email,
      amount: amountKobo,
      currency: "GHS",
      channels,
      firstname: firstName,
      lastname: lastName,
      // don't pass 'phone' attr (Paystack collects inside modal); include in metadata
      metadata: {
        custom_fields: [
          {
            display_name: "Donor",
            variable_name: "donor",
            value: state?.donor || "Anonymous",
          },
          {
            display_name: "First Name",
            variable_name: "first_name",
            value: firstName,
          },
          {
            display_name: "Last Name",
            variable_name: "last_name",
            value: lastName,
          },
          ...(needsPhone
            ? [
                {
                  display_name: "Phone",
                  variable_name: "msisdn",
                  value: msisdn,
                },
              ]
            : []),
          { display_name: "Method", variable_name: "method", value: method },
        ],
      },
      callback: onPaystackSuccess,
      onClose: onPaystackClose,
    });

    if (handler && typeof handler.openIframe === "function") {
      handler.openIframe();
    } else {
      setLoading(false);
      setStatusText("Could not initialize payment (handler missing).");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <div className="text-lg font-semibold">{heading}</div>
      <div>
        Amount: <strong>GHC{state?.amount ?? 0}</strong>
      </div>

      <div className="grid gap-2">
        <Input
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={Boolean(state?.firstName)}
        />
        <Input
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={Boolean(state?.lastName)}
        />
        <Input
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={Boolean(state?.email)}
        />
        {needsPhone && (
          <>
            <Input
              className="mt-2"
              placeholder="23324xxxxxxx (no +)"
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value)}
              disabled={IS_DEV} // lock to test number in dev
            />
            {IS_DEV && (
              <p className="text-xs text-muted-foreground">
                Using Paystack test MoMo: {TEST_MOMO}
              </p>
            )}
          </>
        )}
      </div>

      <Button
        className="w-full"
        disabled={loading || !PUBLIC_KEY}
        onClick={startPayment}
      >
        {loading ? "Processing..." : btnText}
      </Button>

      {statusText && (
        <p className="text-sm text-muted-foreground">{statusText}</p>
      )}

      {result && (
        <pre className="bg-muted p-3 rounded text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
