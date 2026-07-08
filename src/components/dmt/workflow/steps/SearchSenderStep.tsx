"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  useCheckRemitter,
  useRegisterRemitter,
  useSendRemitterOtp,
  useVerifyRemitterOtp,
} from "@/src/hooks/useDmt";
import {
  setActiveSenderMobile,
  setSenderReferenceKey,
} from "@/src/lib/dmtSession";
import { useDmtWorkflow, STEP } from "../DmtWorkflowContext";
import OtpDialog from "../OtpDialog";
import type { DmtApiError } from "@/src/types/dmt";

const searchSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
});
type SearchValues = z.infer<typeof searchSchema>;

const registerSchema = z.object({
  name: z.string().min(2, "Enter sender name"),
  aadhaar: z.string().regex(/^\d{12}$/, "Enter valid 12-digit Aadhaar"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
  address: z.string().min(5, "Enter address"),
  state: z.string().min(2, "Enter state"),
});
type RegisterValues = z.infer<typeof registerSchema>;

export default function SearchSenderStep() {
  const { mobile, setMobile, referenceKey, setReferenceKey, setSender, goToStep } =
    useDmtWorkflow();

  const checkMutation = useCheckRemitter();
  const registerMutation = useRegisterRemitter();
  const sendOtpMutation = useSendRemitterOtp();
  const verifyOtpMutation = useVerifyRemitterOtp();

  const [notFound, setNotFound] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchForm = useForm<SearchValues>({
    resolver: zodResolver(searchSchema) as Resolver<SearchValues>,
    defaultValues: { mobile: mobile || "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterValues>,
    defaultValues: { name: "", aadhaar: "", pincode: "", address: "", state: "" },
  });

  /** STEP 1 — POST /remitter/check */
  const runCheck = async (mobileValue: string) => {
    const result = await checkMutation.mutateAsync(mobileValue);
    setMobile(mobileValue);
    setActiveSenderMobile(mobileValue);
    if (result.referenceKey) {
      setReferenceKey(result.referenceKey);
      setSenderReferenceKey(result.referenceKey);
    }
    return result;
  };

  const onSearch = async (values: SearchValues) => {
    setError(null);
    setNotFound(false);
    try {
      const result = await runCheck(values.mobile);
      if (result.exists && result.sender) {
        setSender(result.sender);
        toast.success("Sender found");
        goToStep(STEP.DETAILS);
      } else {
        // found = false → auto open register form, mobile prefilled, no popup
        setNotFound(true);
        toast.info("Sender not registered. Please register below.");
      }
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped.message);
      toast.error(mapped.message);
    }
  };

  /** STEP 2 — POST /remitter/register then send OTP */
  const onRegister = async (values: RegisterValues) => {
    setError(null);
    const mobileValue = searchForm.getValues("mobile");
    try {
      let refKey = referenceKey;
      if (!refKey) {
        const check = await runCheck(mobileValue);
        refKey = check.referenceKey || "";
      }
      if (!refKey) {
        throw Object.assign(new Error("Reference key missing. Search again."), {
          code: "VALIDATION_ERROR",
        });
      }

      const registered = await registerMutation.mutateAsync({
        mobile: mobileValue,
        aadhaar: values.aadhaar,
        firstName: values.name.trim(),
        pincode: values.pincode,
        address: values.address,
        state: values.state,
        referenceKey: refKey,
      });
      console.log("Registered sender:", registered);

      const otpResult = await sendOtpMutation.mutateAsync(mobileValue);
      const nextKey = otpResult.referenceKey || registered.referenceKey || refKey;
      setReferenceKey(nextKey);
      setSenderReferenceKey(nextKey);
      setOtpOpen(true);
      toast.success("OTP sent to sender mobile");
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped.message);
      toast.error(mapped.message);
    }
  };

  /** STEP 3 — POST /remitter/verify-otp → auto re-check → open profile */
  const onVerifyOtp = async (otp: string) => {
    const mobileValue = searchForm.getValues("mobile");
    try {
      await verifyOtpMutation.mutateAsync({
        mobile: mobileValue,
        otp,
        referenceKey: referenceKey || undefined,
      });
      toast.success("Sender verified");
      setOtpOpen(false);

      // Automatically call remitter/check again
      const result = await runCheck(mobileValue);
      if (result.exists && result.sender) {
        setSender(result.sender);
        goToStep(STEP.DETAILS);
      } else {
        // Even if check doesn't echo details, proceed with mobile to details step
        setSender(null);
        goToStep(STEP.DETAILS);
      }
    } catch (err) {
      const mapped = err as DmtApiError;
      toast.error(mapped.message);
    }
  };

  const searching = checkMutation.isPending;
  const registering =
    registerMutation.isPending || sendOtpMutation.isPending || checkMutation.isPending;

  return (
    <Box>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: notFound ? 3 : 0 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
            Search Sender
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter mobile number to check remitter (POST /remitter/check)
          </Typography>

          <Box
            component="form"
            onSubmit={searchForm.handleSubmit(onSearch)}
            sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}
          >
            <Controller
              name="mobile"
              control={searchForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Mobile Number"
                  placeholder="10-digit mobile"
                  sx={{ flex: 1, minWidth: 220 }}
                  slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={searching}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={searching}
              startIcon={searching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
              sx={{ height: 56 }}
            >
              Search
            </Button>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {notFound ? (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PersonAddIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Register Sender
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mobile {searchForm.getValues("mobile")} is not registered. Fill details to register.
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box
              component="form"
              onSubmit={registerForm.handleSubmit(onRegister)}
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <Controller
                name="name"
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    placeholder="As per Aadhaar"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={registering}
                  />
                )}
              />
              <Controller
                name="aadhaar"
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Aadhaar Number"
                    placeholder="12-digit Aadhaar"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{ htmlInput: { maxLength: 12, inputMode: "numeric" } }}
                    disabled={registering}
                  />
                )}
              />
              <Controller
                name="pincode"
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Pincode"
                    placeholder="6-digit pincode"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric" } }}
                    disabled={registering}
                  />
                )}
              />
              <Controller
                name="state"
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="State"
                    placeholder="State"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={registering}
                  />
                )}
              />
              <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                <Controller
                  name="address"
                  control={registerForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Address"
                      placeholder="Full address"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={registering}
                    />
                  )}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={registering}
                  startIcon={registering ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                  Register Sender
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : null}

      <OtpDialog
        open={otpOpen}
        title="Verify Sender OTP"
        description={`Enter OTP sent to ${searchForm.getValues("mobile")}`}
        submitting={verifyOtpMutation.isPending || checkMutation.isPending}
        onClose={() => setOtpOpen(false)}
        onSubmit={onVerifyOtp}
        onResend={() => sendOtpMutation.mutate(searchForm.getValues("mobile"))}
      />
    </Box>
  );
}
