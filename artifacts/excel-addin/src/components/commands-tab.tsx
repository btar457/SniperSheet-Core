import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Calculator, Play, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";

import {
  useExecuteCommand,
  useGetCommandHistory,
  getGetCommandHistoryQueryKey,
} from "@workspace/api-client-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

const COMMAND_REFERENCE = [
  { ar: "جمع / اجمع / مجموع",    en: "sum",      formula: "=SUM(...)"     },
  { ar: "ضرب / اضرب / حاصل",     en: "multiply", formula: "=PRODUCT(...)" },
  { ar: "متوسط / وسط",           en: "average",  formula: "=AVERAGE(...)"},
  { ar: "أقل / أصغر / الأدنى",   en: "min",      formula: "=MIN(...)"     },
  { ar: "أكبر / أعلى / الأقصى",  en: "max",      formula: "=MAX(...)"     },
  { ar: "طرح / ناقص",            en: "subtract", formula: "=(...-...)"    },
  { ar: "قسمة / اقسم / مقسوم",   en: "divide",   formula: "=(.../.../…)" },
];

const commandSchema = z.object({
  command: z.string().min(1, "الأمر مطلوب / Command is required"),
  values: z.string().min(1, "القيم مطلوبة / Values are required"),
  cellRange: z.string().optional(),
});

type CommandFormValues = z.infer<typeof commandSchema>;

export function CommandsTab() {
  const queryClient = useQueryClient();
  const executeCommand = useExecuteCommand();
  const [showRef, setShowRef] = useState(false);

  const { data: history = [], isLoading: isLoadingHistory } = useGetCommandHistory({
    query: { queryKey: getGetCommandHistoryQueryKey() },
  });

  const form = useForm<CommandFormValues>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      command: "",
      values: "",
      cellRange: "",
    },
  });

  function onSubmit(data: CommandFormValues) {
    const numericValues = data.values
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v));

    if (numericValues.length === 0) {
      form.setError("values", { message: "يجب إدخال أرقام صحيحة مفصولة بفاصلة / Enter valid comma-separated numbers" });
      return;
    }

    executeCommand.mutate(
      {
        data: {
          command: data.command,
          values: numericValues,
          cellRange: data.cellRange || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCommandHistoryQueryKey() });
          form.setValue("values", "");
        },
      }
    );
  }

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      <Card className="shadow-xs border-border flex-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            تنفيذ الأمر / Execute Command
          </CardTitle>
          <CardDescription className="text-xs">
            أدخل الأمر بالعربية أو الإنجليزية &bull; Arabic or English commands supported
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="command"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground font-medium">
                        الأمر / Function
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="جمع / sum"
                          className="h-8 text-sm"
                          dir="auto"
                          data-testid="input-command"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cellRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground font-medium">
                        النطاق / Range
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A1:C3"
                          className="h-8 text-sm"
                          data-testid="input-cell-range"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="values"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground font-medium">
                      القيم / Values (مفصولة بفاصلة / comma-separated)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10, 20, 30"
                        className="h-8 text-sm font-mono"
                        data-testid="input-values"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-8 text-xs font-medium"
                disabled={executeCommand.isPending}
                data-testid="button-execute-command"
              >
                {executeCommand.isPending ? (
                  "جاري الحساب... / Calculating..."
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1.5" />
                    تشغيل / Run Command
                  </>
                )}
              </Button>
            </form>
          </Form>

          {executeCommand.isError && (
            <Alert variant="destructive" className="py-2 px-3">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs ms-2" dir="auto">
                {(executeCommand.error as any)?.data?.error ?? "حدث خطأ / An error occurred"}
              </AlertDescription>
            </Alert>
          )}

          {executeCommand.data && !executeCommand.isPending && (
            <div className="mt-1 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md border border-border/50 gap-1">
                <div className="text-xs text-muted-foreground font-mono">{executeCommand.data.formula}</div>
                <div
                  className="text-2xl font-bold font-mono tracking-tight text-foreground"
                  data-testid="text-command-result"
                >
                  {executeCommand.data.result.toLocaleString("ar-EG")}
                </div>
                <div className="text-[10px] text-muted-foreground text-center" dir="auto">
                  {executeCommand.data.description}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command Reference */}
      <div className="flex-none">
        <button
          onClick={() => setShowRef((v) => !v)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
          data-testid="button-toggle-reference"
        >
          <span className="font-medium">الأوامر المدعومة / Supported Commands</span>
          {showRef ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showRef && (
          <div className="mt-1 border border-border rounded-md overflow-hidden animate-in fade-in slide-in-from-top-1">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">عربي</th>
                  <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">English</th>
                  <th className="text-left px-2 py-1.5 font-medium text-muted-foreground font-mono">Formula</th>
                </tr>
              </thead>
              <tbody>
                {COMMAND_REFERENCE.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => {
                      form.setValue("command", row.en);
                      setShowRef(false);
                    }}
                  >
                    <td className="px-2 py-1.5 text-right" dir="rtl">{row.ar}</td>
                    <td className="px-2 py-1.5 font-medium text-primary">{row.en}</td>
                    <td className="px-2 py-1.5 font-mono text-muted-foreground">{row.formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-2 py-1.5 text-[10px] text-muted-foreground bg-muted/30 border-t border-border/50">
              انقر على أي صف لاختياره / Click any row to select it
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            السجل / History
          </h3>
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-2 pb-4">
            {isLoadingHistory ? (
              <div className="text-xs text-center text-muted-foreground py-4">جاري التحميل...</div>
            ) : history.length === 0 ? (
              <div className="text-xs text-center text-muted-foreground py-6 border border-dashed rounded-md bg-muted/30">
                لا توجد أوامر بعد / No commands run yet
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-md p-2.5 hover:border-primary/30 transition-colors flex flex-col gap-1.5"
                  data-testid={`card-history-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground flex-1 truncate">
                      {item.formula}
                    </div>
                    <div className="font-mono font-bold tabular-nums whitespace-nowrap text-primary">
                      {item.result.toLocaleString("ar-EG")}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="truncate max-w-[160px]" dir="auto">
                      {item.command}
                      {item.cellRange ? ` — ${item.cellRange}` : ` — ${item.values.join(", ")}`}
                    </div>
                    <div>{format(new Date(item.executedAt), "HH:mm:ss")}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
