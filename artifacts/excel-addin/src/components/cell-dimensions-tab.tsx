import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ruler, Maximize } from "lucide-react";

import {
  useCalculateCellDimensions,
  useCalculateBatchCellDimensions,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const cellDimensionSchema = z.object({
  text: z.string().min(1, "النص مطلوب / Text is required"),
  fontSize: z.coerce.number().min(6).max(72).default(11),
  bold: z.boolean().default(false),
  padding: z.coerce.number().min(0).max(50).default(8),
  maxWidth: z.coerce.number().min(0).optional(),
  wrapText: z.boolean().default(false),
});

type CellDimensionFormValues = z.infer<typeof cellDimensionSchema>;

const batchDimensionSchema = z.object({
  texts: z.string().min(1, "أدخل نصاً واحداً على الأقل / At least one line is required"),
  fontSize: z.coerce.number().min(6).max(72).default(11),
  bold: z.boolean().default(false),
  padding: z.coerce.number().min(0).max(50).default(8),
  maxWidth: z.coerce.number().min(0).optional(),
  wrapText: z.boolean().default(false),
  uniformWidth: z.boolean().default(true),
  uniformHeight: z.boolean().default(false),
});

type BatchDimensionFormValues = z.infer<typeof batchDimensionSchema>;

export function CellDimensionsTab() {
  const calculateSingle = useCalculateCellDimensions();
  const calculateBatch = useCalculateBatchCellDimensions();

  const singleForm = useForm<CellDimensionFormValues>({
    resolver: zodResolver(cellDimensionSchema),
    defaultValues: {
      text: "",
      fontSize: 11,
      bold: false,
      padding: 8,
      maxWidth: undefined,
      wrapText: false,
    },
  });

  const batchForm = useForm<BatchDimensionFormValues>({
    resolver: zodResolver(batchDimensionSchema),
    defaultValues: {
      texts: "",
      fontSize: 11,
      bold: false,
      padding: 8,
      maxWidth: undefined,
      wrapText: false,
      uniformWidth: true,
      uniformHeight: false,
    },
  });

  function onSingleSubmit(data: CellDimensionFormValues) {
    calculateSingle.mutate({
      data: {
        text: data.text,
        fontSize: data.fontSize,
        bold: data.bold,
        padding: data.padding,
        maxWidth: data.maxWidth || undefined,
        wrapText: data.wrapText,
      },
    });
  }

  function onBatchSubmit(data: BatchDimensionFormValues) {
    const lines = data.texts.split("\n").filter((line) => line.trim().length > 0);
    calculateBatch.mutate({
      data: {
        cells: lines.map((text) => ({
          text,
          fontSize: data.fontSize,
          bold: data.bold,
          padding: data.padding,
          maxWidth: data.maxWidth || undefined,
          wrapText: data.wrapText,
        })),
        uniformWidth: data.uniformWidth,
        uniformHeight: data.uniformHeight,
      },
    });
  }

  return (
    <div>
      <Tabs defaultValue="single" className="flex flex-col w-full">
        <div className="px-[10px] pt-3 pb-2">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="single" className="text-xs" data-testid="tab-single-cell">
              خلية واحدة / Single
            </TabsTrigger>
            <TabsTrigger value="batch" className="text-xs" data-testid="tab-batch-cells">
              مجموعة / Batch
            </TabsTrigger>
          </TabsList>
        </div>

        <div>
          <div className="px-[10px] pb-8">
            {/* Single Cell Tab */}
            <TabsContent value="single" className="mt-0 space-y-4">
              <Form {...singleForm}>
                <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-4">
                  <FormField
                    control={singleForm.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          نص الخلية / Cell Text
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل محتوى الخلية... / Enter cell content..."
                            className="resize-none min-h-[80px] text-sm"
                            dir="auto"
                            data-testid="input-cell-text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    <FormField
                      control={singleForm.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">حجم الخط (pt)</FormLabel>
                          <FormControl>
                            <Input type="number" className="h-8 text-sm" data-testid="input-font-size" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={singleForm.control}
                      name="padding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">الهامش / Padding (px)</FormLabel>
                          <FormControl>
                            <Input type="number" className="h-8 text-sm" data-testid="input-padding" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={singleForm.control}
                      name="maxWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">أقصى عرض (px)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="بلا حد / None"
                              className="h-8 text-sm"
                              data-testid="input-max-width"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col justify-end space-y-2 pb-1.5">
                      <FormField
                        control={singleForm.control}
                        name="bold"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-bold" />
                            </FormControl>
                            <FormLabel className="text-xs font-normal">عريض / Bold</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={singleForm.control}
                        name="wrapText"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-wrap-text" />
                            </FormControl>
                            <FormLabel className="text-xs font-normal">التفاف / Wrap</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-8 text-xs font-medium"
                    disabled={calculateSingle.isPending}
                    data-testid="button-calculate-single"
                  >
                    {calculateSingle.isPending ? "جاري الحساب... / Calculating..." : "احسب الأبعاد / Calculate Dimensions"}
                  </Button>
                </form>
              </Form>

              {calculateSingle.data && !calculateSingle.isPending && (
                <Card className="shadow-none border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-2">
                  <CardHeader className="p-3 pb-2 border-b border-border/50">
                    <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-primary" />
                      النتائج / Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">الحجم بالبكسل / Pixel</div>
                        <div className="font-mono text-sm font-semibold" data-testid="text-px-dimensions">
                          {Math.round(calculateSingle.data.width)} &times; {Math.round(calculateSingle.data.height)} px
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">وحدة Excel</div>
                        <div className="font-mono text-sm font-semibold text-primary" data-testid="text-excel-dimensions">
                          W: {calculateSingle.data.widthExcel.toFixed(2)}
                          <span className="text-muted-foreground font-normal mx-1">|</span>
                          H: {calculateSingle.data.heightExcel.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">المحتوى / Content</div>
                        <div className="font-mono text-xs" data-testid="text-content-stats">
                          {calculateSingle.data.characterCount} حرف / {calculateSingle.data.lineCount} سطر
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Batch Tab */}
            <TabsContent value="batch" className="mt-0 space-y-4">
              <Form {...batchForm}>
                <form onSubmit={batchForm.handleSubmit(onBatchSubmit)} className="space-y-4">
                  <FormField
                    control={batchForm.control}
                    name="texts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          نصوص الخلايا (سطر لكل خلية) / Cell Texts (one per line)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={"سطر البيانات الأول\nData row 2\nمحتوى أطول قد ينكسر في السطور"}
                            className="resize-y min-h-[100px] text-sm leading-relaxed"
                            dir="auto"
                            data-testid="input-batch-texts"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    <FormField
                      control={batchForm.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">حجم الخط (pt)</FormLabel>
                          <FormControl>
                            <Input type="number" className="h-8 text-sm" data-testid="input-batch-font-size" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={batchForm.control}
                      name="padding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">الهامش / Padding (px)</FormLabel>
                          <FormControl>
                            <Input type="number" className="h-8 text-sm" data-testid="input-batch-padding" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2 pt-1 border-t border-border/50 grid grid-cols-2 gap-2 mt-1">
                      <FormField
                        control={batchForm.control}
                        name="uniformWidth"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-uniform-width" />
                            </FormControl>
                            <FormLabel className="text-xs font-normal">عرض موحد / Uniform</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={batchForm.control}
                        name="bold"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-batch-bold" />
                            </FormControl>
                            <FormLabel className="text-xs font-normal">عريض / Bold</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-8 text-xs font-medium"
                    disabled={calculateBatch.isPending}
                    data-testid="button-calculate-batch"
                  >
                    {calculateBatch.isPending ? "جاري الحساب..." : "احسب المجموعة / Calculate Batch"}
                  </Button>
                </form>
              </Form>

              {calculateBatch.data && !calculateBatch.isPending && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-1.5 mb-2 opacity-90">
                      <Maximize className="w-3.5 h-3.5" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">الأبعاد الموصى بها / Recommended</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-primary-foreground/10 rounded p-2">
                        <div className="text-[10px] opacity-80 mb-0.5">عرض Excel / Width</div>
                        <div className="font-mono text-lg font-bold" data-testid="text-batch-rec-width">
                          {calculateBatch.data.recommendedWidth.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-primary-foreground/10 rounded p-2">
                        <div className="text-[10px] opacity-80 mb-0.5">ارتفاع Excel / Height</div>
                        <div className="font-mono text-lg font-bold" data-testid="text-batch-rec-height">
                          {calculateBatch.data.recommendedHeight.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground px-1 flex items-center justify-between">
                    <span>تحليل {calculateBatch.data.results.length} خلية / cells analyzed</span>
                    <span>Max Px: {Math.round(calculateBatch.data.maxWidth)}&times;{Math.round(calculateBatch.data.maxHeight)}</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
