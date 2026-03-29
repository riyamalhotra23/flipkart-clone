import { useState } from "react";
import { useLocation } from "wouter";
import { useGetCart, usePlaceOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, ChevronDown, Circle, MapPin, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid 10-digit phone required"),
  pincode: z.string().min(6, "Valid 6-digit pincode required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1); // 1: Address, 2: Payment
  const [savedAddress, setSavedAddress] = useState<AddressFormValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const { data: cart, isLoading } = useGetCart({ query: { retry: false } });
  const placeOrderMutation = usePlaceOrder();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "Guest User",
      phone: "9876543210",
      pincode: "560103",
      addressLine1: "Outer Ring Road, Devarabeesanahalli",
      addressLine2: "Bellandur",
      city: "Bengaluru",
      state: "Karnataka"
    }
  });

  const onAddressSubmit = (data: AddressFormValues) => {
    setSavedAddress(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = () => {
    if (!savedAddress) return;

    placeOrderMutation.mutate({
      data: {
        shippingAddress: savedAddress,
        paymentMethod: paymentMethod
      }
    }, {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setLocation(`/orders/${order.id}`);
      },
      onError: () => {
        toast({ title: "Failed to place order", variant: "destructive" });
      }
    });
  };

  if (isLoading || (!cart && !isLoading)) return null;

  if (cart?.items.length === 0) {
    setLocation('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
        
        {/* Left Col: Accordions */}
        <div className="flex-1 w-full flex flex-col gap-4">
          
          {/* STEP 1: LOGIN (Mock completed) */}
          <div className="bg-card rounded-sm shadow-sm overflow-hidden flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 text-primary px-2 rounded text-sm font-medium h-6 flex items-center">1</div>
              <div className="font-medium text-gray-500">LOGIN</div>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Guest User <span className="font-normal text-gray-500">+91 9876543210</span></div>
          </div>

          {/* STEP 2: ADDRESS */}
          <div className="bg-card rounded-sm shadow-sm overflow-hidden">
            <div className={`p-4 flex items-center gap-4 ${step === 1 ? 'bg-primary text-white' : ''}`}>
               <div className={`px-2 rounded text-sm font-medium h-6 flex items-center ${step === 1 ? 'bg-white text-primary' : 'bg-gray-100 text-primary'}`}>2</div>
               <div className={`font-medium ${step === 1 ? 'text-white' : 'text-gray-500'}`}>DELIVERY ADDRESS</div>
               {step > 1 && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
            </div>
            
            {step === 1 && (
              <div className="p-6 bg-[#f5faff]">
                <form onSubmit={form.handleSubmit(onAddressSubmit)} className="flex flex-col gap-4 max-w-xl">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input {...form.register("fullName")} placeholder="Name" className="w-full p-3 border rounded-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      {form.formState.errors.fullName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.fullName.message}</p>}
                    </div>
                    <div className="flex-1">
                      <input {...form.register("phone")} placeholder="10-digit mobile number" className="w-full p-3 border rounded-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input {...form.register("pincode")} placeholder="Pincode" className="w-full p-3 border rounded-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="flex-1">
                      <input {...form.register("city")} placeholder="City/District/Town" className="w-full p-3 border rounded-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="w-1/2 pr-2">
                    <input {...form.register("state")} placeholder="State" className="w-full p-3 border rounded-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  </div>

                  <textarea {...form.register("addressLine1")} placeholder="Address (Area and Street)" rows={3} className="w-full p-3 border rounded-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  <input {...form.register("addressLine2")} placeholder="Landmark (Optional)" className="w-full p-3 border rounded-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />

                  <div className="pt-4">
                    <button type="submit" className="bg-[#fb641b] text-white px-10 py-3.5 rounded-sm font-bold text-sm shadow-sm hover:shadow-md transition-shadow uppercase">
                      Deliver Here
                    </button>
                  </div>
                </form>
              </div>
            )}
            {step > 1 && savedAddress && (
              <div className="p-4 px-12 text-sm text-foreground">
                <span className="font-bold">{savedAddress.fullName}</span> {savedAddress.phone} <br/>
                {savedAddress.addressLine1}, {savedAddress.city}, {savedAddress.state} - <span className="font-bold">{savedAddress.pincode}</span>
                <button onClick={() => setStep(1)} className="ml-4 text-primary font-medium hover:underline">Change</button>
              </div>
            )}
          </div>

          {/* STEP 3: ORDER SUMMARY (Mock completed visually when not active) */}
          <div className="bg-card rounded-sm shadow-sm overflow-hidden flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 text-primary px-2 rounded text-sm font-medium h-6 flex items-center">3</div>
              <div className="font-medium text-gray-500">ORDER SUMMARY</div>
              {step === 2 && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
            </div>
            {step === 2 && <div className="text-sm font-medium">{cart?.itemCount} Item{cart?.itemCount !== 1 ? 's' : ''}</div>}
          </div>

          {/* STEP 4: PAYMENT */}
          <div className="bg-card rounded-sm shadow-sm overflow-hidden">
            <div className={`p-4 flex items-center gap-4 ${step === 2 ? 'bg-primary text-white' : ''}`}>
               <div className={`px-2 rounded text-sm font-medium h-6 flex items-center ${step === 2 ? 'bg-white text-primary' : 'bg-gray-100 text-primary'}`}>4</div>
               <div className={`font-medium ${step === 2 ? 'text-white' : 'text-gray-500'}`}>PAYMENT OPTIONS</div>
            </div>
            
            {step === 2 && (
              <div className="flex flex-col">
                <label className={`flex items-start gap-4 p-4 border-b cursor-pointer ${paymentMethod === 'UPI' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="peer sr-only" />
                    <div className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-primary peer-checked:border-[5px]"></div>
                  </div>
                  <div>
                    <span className="font-medium block">UPI (PhonePe, GPay, etc.)</span>
                    {paymentMethod === 'UPI' && <div className="mt-4 text-sm text-gray-500">UPI payment integration would appear here.</div>}
                  </div>
                </label>
                
                <label className={`flex items-start gap-4 p-4 border-b cursor-pointer ${paymentMethod === 'CARD' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <input type="radio" name="payment" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="peer sr-only" />
                    <div className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-primary peer-checked:border-[5px]"></div>
                  </div>
                  <div>
                    <span className="font-medium block">Credit / Debit / ATM Card</span>
                    {paymentMethod === 'CARD' && <div className="mt-4 text-sm text-gray-500">Card input fields would appear here.</div>}
                  </div>
                </label>
                
                <label className={`flex items-start gap-4 p-4 border-b cursor-pointer ${paymentMethod === 'COD' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="mt-0.5 relative flex items-center justify-center">
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="peer sr-only" />
                    <div className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-primary peer-checked:border-[5px]"></div>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium block">Cash on Delivery</span>
                    {paymentMethod === 'COD' && (
                      <div className="mt-6 flex flex-col items-end border-t border-gray-200 pt-4">
                        <button 
                          onClick={handlePlaceOrder}
                          disabled={placeOrderMutation.isPending}
                          className="bg-[#fb641b] text-white px-12 py-4 rounded-sm font-bold text-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
                        >
                          {placeOrderMutation.isPending ? "PROCESSING..." : `CONFIRM ORDER`}
                        </button>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Summary */}
        <div className="w-full lg:w-[350px] shrink-0 sticky top-[80px]">
          <div className="bg-card rounded-sm shadow-sm flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="uppercase text-gray-500 font-medium text-sm">Price Details</h3>
            </div>
            
            <div className="p-6 flex flex-col gap-4 text-sm md:text-base">
              <div className="flex justify-between">
                <span>Price ({cart?.itemCount} items)</span>
                <span>{formatCurrency(cart?.subtotal || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-success">
                  {cart?.deliveryCharge === 0 ? "Free" : formatCurrency(cart?.deliveryCharge || 0)}
                </span>
              </div>
              
              <div className="border-t border-dashed border-gray-300 my-2 pt-4 flex justify-between font-bold text-lg">
                <span>Amount Payable</span>
                <span>{formatCurrency(cart?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
