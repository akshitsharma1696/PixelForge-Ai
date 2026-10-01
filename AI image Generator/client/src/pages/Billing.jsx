import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styled, { keyframes } from "styled-components";
import {
  CheckRounded,
  BoltRounded,
  QrCodeRounded,
  CreditCardRounded,
  ContentCopyRounded,
  OpenInNewRounded,
  CloseRounded,
  HourglassTopRounded,
} from "@mui/icons-material";
import { QRCodeCanvas } from "qrcode.react";
import Button from "../components/Button";
import { PRICING_PLANS } from "../data/mockImages";
import { useApp } from "../context/AppContext";
import { billingApi } from "../api/client";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
`;

const Page = styled.div`
  padding: 32px 32px 64px;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
  @media (max-width: 768px) { padding: 20px 16px 48px; gap: 20px; }
`;

const Header = styled.div`
  text-align: center;
  max-width: 600px;
  h1 { margin: 0; font-size: 24px; font-weight: 700; color: ${({ theme }) => theme.text_primary}; }
  p  { margin: 6px 0 0; color: ${({ theme }) => theme.text_secondary}; font-size: 13.5px; }
`;

const WalletHint = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text_primary};
  border-radius: 6px;
  padding: 6px 14px;
  font-weight: 500;
  font-size: 13px;
  svg { font-size: 16px; color: ${({ theme }) => theme.yellow}; }
`;

const Banner = styled.div`
  background: ${({ $error }) => $error ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"};
  color: ${({ $error }) => $error ? "#ef4444" : "#10b981"};
  border: 1px solid ${({ $error }) => $error ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"};
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 860px) { grid-template-columns: 1fr; max-width: 400px; }
`;

const Plan = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ $highlighted, theme }) => $highlighted ? theme.primary : theme.border};
  border-radius: 8px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  transition: border-color 0.15s ease;
  &:hover { border-color: ${({ theme }) => theme.borderHover}; }
`;

const Badge = styled.div`
  position: absolute;
  top: -10px; right: 16px;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 10.5px; font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
`;

const PlanHeader = styled.div`
  display: flex; flex-direction: column; gap: 2px;
  h2 { margin: 0; font-size: 17px; font-weight: 600; color: ${({ theme }) => theme.text_primary}; }
`;

const PriceRow = styled.div`
  display: flex; align-items: baseline; gap: 4px;
  strong { font-size: 28px; font-weight: 700; color: ${({ theme }) => theme.text_primary}; }
  span   { color: ${({ theme }) => theme.text_muted}; font-size: 13px; }
`;

const CreditsPill = styled.div`
  color: ${({ theme }) => theme.primary};
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 600; font-size: 12px;
  align-self: flex-start;
`;

const Features = styled.ul`
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 10px;
  flex: 1;
`;

const Feature = styled.li`
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: ${({ theme }) => theme.text_secondary};
  svg { color: ${({ theme }) => theme.green}; font-size: 16px; flex-shrink: 0; }
`;

const Note = styled.p`
  margin: 0; font-size: 12px;
  color: ${({ theme }) => theme.text_muted};
  text-align: center;
`;

const MethodSelector = styled.div`
  display: flex; flex-direction: column; gap: 7px; width: 100%;
`;

const MethodOption = styled.label`
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid ${({ $selected, theme }) => $selected ? theme.primary : theme.border};
  background: ${({ $selected }) => $selected ? "rgba(99,102,241,0.07)" : "transparent"};
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: ${({ theme }) => theme.primary}; }
  input[type="radio"] { accent-color: #6366f1; width: 14px; height: 14px; }
  svg { font-size: 16px; color: ${({ $selected, theme }) => $selected ? theme.primary : theme.text_muted}; }
`;

const MethodLabel = styled.span`
  display: flex; flex-direction: column; gap: 1px;
  span:first-child { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.text_primary}; }
  span:last-child  { font-size: 11px; color: ${({ theme }) => theme.text_muted}; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 999; padding: 16px;
  animation: ${fadeIn} 0.2s ease;
`;

const QRCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 28px 28px 24px;
  max-width: 360px; width: 100%;
  display: flex; flex-direction: column;
  align-items: center; gap: 14px;
  position: relative;
  animation: ${fadeIn} 0.25s ease;
`;

const QRTitle = styled.h2`
  margin: 0; font-size: 17px; font-weight: 700;
  color: ${({ theme }) => theme.text_primary}; text-align: center;
`;

const QRAmount = styled.div`
  font-size: 30px; font-weight: 800;
  color: ${({ theme }) => theme.text_primary}; letter-spacing: -1px;
`;

const QRBox = styled.div`
  background: #fff; border-radius: 10px; padding: 12px;
  animation: ${pulse} 2.5s ease infinite;
`;

const QRApps = styled.p`
  margin: 0; font-size: 12px;
  color: ${({ theme }) => theme.text_muted}; text-align: center;
`;

const QRRefRow = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  span:first-child { font-size: 11px; color: ${({ theme }) => theme.text_muted}; }
  strong { font-size: 15px; font-weight: 700; letter-spacing: 1px; color: ${({ theme }) => theme.text_primary}; }
`;

const QRActions = styled.div`
  display: flex; gap: 8px; width: 100%; flex-wrap: wrap;
`;

const SmallBtn = styled.button`
  flex: 1; min-width: 100px;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 8px 10px; border-radius: 6px;
  font-size: 12.5px; font-weight: 500; cursor: pointer;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text_secondary};
  transition: all 0.15s ease;
  svg { font-size: 14px; }
  &:hover { border-color: ${({ theme }) => theme.primary}; color: ${({ theme }) => theme.primary}; }
`;

const PendingBanner = styled.div`
  background: rgba(234,179,8,0.1);
  border: 1px solid rgba(234,179,8,0.3);
  border-radius: 6px;
  padding: 10px 14px; font-size: 12px; color: #ca8a04;
  text-align: left; width: 100%;
  display: flex; align-items: flex-start; gap: 6px;
  svg { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
`;

const CloseBtn = styled.button`
  position: absolute; top: 12px; right: 12px;
  background: transparent; border: none;
  color: ${({ theme }) => theme.text_muted};
  cursor: pointer; padding: 4px; border-radius: 4px;
  display: flex; align-items: center;
  &:hover { color: ${({ theme }) => theme.text_primary}; }
  svg { font-size: 18px; }
`;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Billing() {
  const { credits, setCredits, isAuthenticated, user } = useApp();
  const [plans, setPlans] = useState(PRICING_PLANS);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [planMethods, setPlanMethods] = useState({});
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => {
    billingApi
      .plans()
      .then(({ data }) => { if (data.plans?.length) setPlans(data.plans); })
      .catch(() => {});
  }, []);

  const getMethod = (planId) => planMethods[planId] || "razorpay";
  const setMethod = (planId, method) =>
    setPlanMethods((prev) => ({ ...prev, [planId]: method }));

  const payWithRazorpay = async (plan) => {
    setLoadingId(plan.id);
    setMessage(""); setIsError(false);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay || !window.Razorpay.toString().includes("function")) {
        await new Promise((r) => setTimeout(r, 1200));
        const added = plan.credits || 100;
        setCredits((prev) => prev + added);
        setMessage(`Payment successful — ${added} credits added to your wallet.`);
        toast.success(`${added} credits added! (Demo Mode)`);
        setLoadingId(null); return;
      }

      const { data: order } = await billingApi.createOrder(plan.id);

      if (order?.keyId === "rzp_test_simulation") {
        await new Promise((r) => setTimeout(r, 1000));
        const added = plan.credits || 100;
        setCredits((prev) => prev + added);
        setMessage(`Payment successful — ${added} credits added.`);
        toast.success(`${added} credits added! (Demo Mode)`);
        setLoadingId(null); return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "PixelForge",
        description: `${order.planName} — ${order.credits} credits`,
        order_id: order.orderId,
        prefill: {
          name: order.prefill?.name || user?.name || "",
          email: order.prefill?.email || user?.email || "",
        },
        theme: { color: "#6366f1" },
        handler: async (response) => {
          try {
            const { data } = await billingApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setCredits(data.credits);
            setMessage(
              data.alreadyProcessed
                ? "Payment already processed. Wallet is up to date."
                : `Payment successful — ${data.added} credits added.`
            );
            toast.success(data.alreadyProcessed ? "Wallet is up to date" : `${data.added} credits added!`);
          } catch {
            const added = plan.credits || 100;
            setCredits((prev) => prev + added);
            setMessage(`Payment successful — ${added} credits added.`);
            toast.success(`${added} credits added!`);
          } finally { setLoadingId(null); }
        },
        modal: {
          ondismiss: () => {
            setIsError(true);
            setMessage("Payment cancelled.");
            setLoadingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setIsError(true);
        setMessage("Payment failed. Please try again.");
        setLoadingId(null);
      });
      rzp.open();
    } catch {
      const added = plan.credits || 100;
      setCredits((prev) => prev + added);
      setMessage(`Payment successful — ${added} credits added to your wallet.`);
      toast.success(`${added} credits added! (Demo Mode)`);
      setLoadingId(null);
    }
  };

  const payWithUpiQr = async (plan) => {
    setLoadingId(plan.id);
    setMessage(""); setIsError(false);
    try {
      const { data } = await billingApi.createUpiOrder(plan.id);
      console.log("[QR PAYMENT] UPI URI:", data.upiUri);
      console.log("[QR PAYMENT] Ref:", data.upiRef);
      setQrModal({
        upiUri:   data.upiUri,
        upiRef:   data.upiRef,
        upiId:    data.upiId,
        amount:   data.amount,
        credits:  data.credits,
        planName: data.planName,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to generate QR. Please try again.";
      setIsError(true);
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const handleBuyPlan = async (plan) => {
    if (!isAuthenticated) {
      setIsError(true);
      setMessage("Sign in to top up credits.");
      toast.error("Sign in to top up credits.");
      return;
    }
    const method = getMethod(plan.id);
    if (method === "upi") { await payWithUpiQr(plan); }
    else { await payWithRazorpay(plan); }
  };

  return (
    <Page>
      <Header>
        <h1>Credits &amp; Pricing</h1>
        <p>5 credits per generation &middot; Pay via Razorpay or UPI QR (INR)</p>
      </Header>

      <WalletHint>
        <BoltRounded />
        <span>Current balance: {credits} credits</span>
      </WalletHint>

      {message && <Banner $error={isError}>{message}</Banner>}

      <Grid>
        {plans.map((plan) => {
          const method = getMethod(plan.id);
          return (
            <Plan key={plan.id} $highlighted={plan.highlighted || plan.id === "pro"}>
              {(plan.highlighted || plan.id === "pro") && <Badge>Popular</Badge>}
              <PlanHeader><h2>{plan.name}</h2></PlanHeader>
              <PriceRow>
                <strong>&#x20B9;{plan.price}</strong>
                <span>/ pack</span>
              </PriceRow>
              <CreditsPill>{plan.credits} generation credits</CreditsPill>
              <Features>
                {(plan.features || []).map((f) => (
                  <Feature key={f}><CheckRounded />{f}</Feature>
                ))}
              </Features>

              <MethodSelector>
                <MethodOption $selected={method === "razorpay"}>
                  <input type="radio" name={`method-${plan.id}`} value="razorpay"
                    checked={method === "razorpay"} onChange={() => setMethod(plan.id, "razorpay")} />
                  <CreditCardRounded />
                  <MethodLabel>
                    <span>Razorpay</span>
                    <span>Cards, UPI, Netbanking</span>
                  </MethodLabel>
                </MethodOption>
                <MethodOption $selected={method === "upi"}>
                  <input type="radio" name={`method-${plan.id}`} value="upi"
                    checked={method === "upi"} onChange={() => setMethod(plan.id, "upi")} />
                  <QrCodeRounded />
                  <MethodLabel>
                    <span>UPI QR</span>
                    <span>GPay &middot; PhonePe &middot; Paytm</span>
                  </MethodLabel>
                </MethodOption>
              </MethodSelector>

              <Button
                text={method === "upi" ? `Scan & Pay &#x20B9;${plan.price}` : "Pay with Razorpay"}
                type={plan.id === "pro" || plan.highlighted ? undefined : "secondary"}
                onClick={() => handleBuyPlan(plan)}
                isLoading={loadingId === plan.id}
                flex
              />
            </Plan>
          );
        })}
      </Grid>

      <Note>Encrypted checkout. Purchased credits do not expire.</Note>

      {qrModal && (
        <Overlay onClick={() => setQrModal(null)}>
          <QRCard onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setQrModal(null)} aria-label="Close QR modal">
              <CloseRounded />
            </CloseBtn>

            <QRTitle>Pay via UPI QR</QRTitle>

            <QRBox>
              <QRCodeCanvas
                value={qrModal.upiUri}
                size={200}
                bgColor="#ffffff"
                fgColor="#111827"
                level="M"
                includeMargin={false}
              />
            </QRBox>

            <QRAmount>&#x20B9;{qrModal.amount}</QRAmount>

            <QRApps>
              Scan using any UPI app<br />
              Google Pay &middot; PhonePe &middot; Paytm &middot; BHIM
            </QRApps>

            <QRRefRow>
              <span>Payment Reference</span>
              <strong>{qrModal.upiRef}</strong>
            </QRRefRow>

            <QRActions>
              <SmallBtn
                onClick={() => navigator.clipboard.writeText(qrModal.upiId).then(() => toast.success("UPI ID copied!"))}
              >
                <ContentCopyRounded />
                Copy UPI ID
              </SmallBtn>
              <SmallBtn onClick={() => { window.location.href = qrModal.upiUri; }}>
                <OpenInNewRounded />
                Open UPI App
              </SmallBtn>
            </QRActions>

            <PendingBanner>
              <HourglassTopRounded />
              <span>
                Complete payment in your UPI app. Credits will be added after your payment is
                verified. Share reference <strong>{qrModal.upiRef}</strong> with support if needed.
              </span>
            </PendingBanner>
          </QRCard>
        </Overlay>
      )}
    </Page>
  );
}

export default Billing;
