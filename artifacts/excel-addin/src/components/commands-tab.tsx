import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Calculator, Play, Clock, Hash, HashIcon } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const commandSchema = z.object({
  command: z.string().min(1, "Command is required"),
  values: z.string().min(1, "Values are required"),
  cellRange: z.string().optional(),
});

type CommandFormValues = z.infer<typeof commandSchema>;

export function CommandsTab() {
  const queryClient = useQueryClient();
  const executeCommand = useExecuteCommand();
  const { data: history = [], isLoading: isLoadingHistory } = useGetCommandHistory({
    query: { queryKey: getGetCommandHistoryQueryKey() },
  });

  const form = useForm<CommandFormValues>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      command: "Sum",
      values: "",
      cellRange: "",
    },
  });

  function onSubmit(data: CommandFormValues) {
    const numericValues = data.values
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v));

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
          form.reset({ ...data, values: "" }); // keep command/range, clear values
        },
      }
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <Card className="shadow-xs border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            Execute Command
          </CardTitle>
          <CardDescription className="text-xs">
            Run functions on ranges or values
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="command"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground font-medium">Function</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sum, Average..."
                          className="h-8 text-sm"
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
                      <FormLabel className="text-xs text-muted-foreground font-medium">Range (Optional)</FormLabel>
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
                    <FormLabel className="text-xs text-muted-foreground font-medium">Values</FormLabel>
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
                className="w-full h-8 text-xs font-medium mt-1"
                disabled={executeCommand.isPending}
                data-testid="button-execute-command"
              >
                {executeCommand.isPending ? (
                  "Calculating..."
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1.5" />
                    Run Command
                  </>
                )}
              </Button>
            </form>
          </Form>

          {executeCommand.data && !executeCommand.isPending && (
            <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{executeCommand.data.formula}</div>
                <div className="text-2xl font-bold font-mono tracking-tight text-foreground" data-testid="text-command-result">
                  {executeCommand.data.result.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                  {executeCommand.data.description}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            History
          </h3>
        </div>
        
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-2 pb-4">
            {isLoadingHistory ? (
              <div className="text-xs text-center text-muted-foreground py-4">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-xs text-center text-muted-foreground py-8 border border-dashed rounded-md bg-muted/30">
                No commands run yet
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-card border border-border rounded-md p-2.5 text-sm hover:border-primary/30 transition-colors flex flex-col gap-1.5 group"
                  data-testid={`card-history-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground flex-1 truncate">
                      {item.formula}
                    </div>
                    <div className="font-mono font-bold text-right tabular-nums whitespace-nowrap text-primary">
                      {item.result.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="truncate max-w-[150px]">
                      {item.cellRange ? `Range: ${item.cellRange}` : `Values: ${item.values.join(", ")}`}
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
