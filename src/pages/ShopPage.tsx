import { useState } from "react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  MAX_QUANTITY_PER_LINE,
  MERCH_ITEMS,
  MerchId,
  getPriceRange,
  getUnitPrice,
} from "@/config/merch";

interface OrderLine {
  key: number;
  itemId: MerchId | "";
  size: string;
  quantity: number;
}

const formatUSD = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

let nextKey = 1;
const newLine = (): OrderLine => ({ key: nextKey++, itemId: "", size: "", quantity: 1 });

const ShopPage = () => {
  const { toast } = useToast();
  const [lines, setLines] = useState<OrderLine[]>([newLine()]);
  const [loading, setLoading] = useState(false);

  const updateLine = (key: number, patch: Partial<OrderLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const removeLine = (key: number) =>
    setLines((prev) => (prev.length === 1 ? [newLine()] : prev.filter((l) => l.key !== key)));

  const lineTotal = (l: OrderLine) => (getUnitPrice(l.itemId, l.size) ?? 0) * l.quantity;
  const subtotal = lines.reduce((sum, l) => sum + Math.round(lineTotal(l) * 100), 0) / 100;
  const itemCount = lines.reduce((sum, l) => sum + (l.itemId && l.size ? l.quantity : 0), 0);
  const isComplete = (l: OrderLine) => l.itemId !== "" && l.size !== "" && l.quantity >= 1;
  const canCheckout = lines.every(isComplete) && !loading;

  const handleCheckout = async () => {
    if (!lines.every(isComplete)) {
      toast({
        title: "Incomplete order",
        description: "Please choose an item, size and quantity for every line.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-merch-checkout", {
        body: {
          items: lines.map(({ itemId, size, quantity }) => ({ itemId, size, quantity })),
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (error) {
      console.error("Error creating merch checkout:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Team Merch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Order polos, t-shirts and hoodies. Every purchase supports the team.
          </p>
        </div>

        {/* Product overview */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto mb-12">
          {MERCH_ITEMS.map((item) => {
            const { min, max } = getPriceRange(item);
            return (
              <Card key={item.id} className="text-center overflow-hidden">
                {item.image && (
                  <div className="aspect-square bg-white border-b">
                    <img
                      src={item.image}
                      alt={`${item.name} — ${item.description}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {min === max ? formatUSD(min) : `${formatUSD(min)} – ${formatUSD(max)}`}
                  </p>
                  <ul className="text-sm text-muted-foreground mt-3 space-y-1">
                    {item.sizes.map((s) => (
                      <li key={s.size} className="flex justify-between max-w-[10rem] mx-auto">
                        <span>{s.size}</span>
                        <span>{formatUSD(s.price)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order form */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Order Form
            </CardTitle>
            <CardDescription>Add a line for each item and size you'd like.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lines.map((line, index) => {
              const item = MERCH_ITEMS.find((i) => i.id === line.itemId);
              return (
                <div
                  key={line.key}
                  className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_auto_auto] gap-3 items-end border-b pb-4"
                >
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor={`item-${line.key}`}>Item {lines.length > 1 ? index + 1 : ""}</Label>
                    <Select
                      value={line.itemId}
                      onValueChange={(v) => updateLine(line.key, { itemId: v as MerchId, size: "" })}
                    >
                      <SelectTrigger id={`item-${line.key}`}>
                        <SelectValue placeholder="Choose an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {MERCH_ITEMS.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name} — from {formatUSD(getPriceRange(i).min)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`size-${line.key}`}>Size</Label>
                    <Select
                      value={line.size}
                      onValueChange={(v) => updateLine(line.key, { size: v })}
                      disabled={!item}
                    >
                      <SelectTrigger id={`size-${line.key}`}>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {item?.sizes.map((s) => (
                          <SelectItem key={s.size} value={s.size}>
                            {s.size} — {formatUSD(s.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`qty-${line.key}`}>Quantity</Label>
                    <Input
                      id={`qty-${line.key}`}
                      type="number"
                      min={1}
                      max={MAX_QUANTITY_PER_LINE}
                      value={line.quantity}
                      onChange={(e) => {
                        const n = Math.floor(Number(e.target.value));
                        updateLine(line.key, {
                          quantity: Math.min(Math.max(isNaN(n) ? 1 : n, 1), MAX_QUANTITY_PER_LINE),
                        });
                      }}
                    />
                  </div>

                  <div className="text-right sm:pb-1 min-w-[5.5rem]">
                    <p className="font-medium">{formatUSD(lineTotal(line))}</p>
                    {line.size && (
                      <p className="text-xs text-muted-foreground">
                        {formatUSD(getUnitPrice(line.itemId, line.size) ?? 0)} each
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    onClick={() => removeLine(line.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Button type="button" variant="outline" onClick={() => setLines((p) => [...p, newLine()])}>
              <Plus className="h-4 w-4 mr-2" />
              Add another item
            </Button>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  Subtotal{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                </span>
                <span className="text-2xl font-bold">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Sales tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <Button
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              onClick={handleCheckout}
              disabled={!canCheckout}
            >
              {loading ? "Redirecting to checkout..." : "Proceed to Payment"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You'll be redirected to Stripe to complete your payment securely.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
