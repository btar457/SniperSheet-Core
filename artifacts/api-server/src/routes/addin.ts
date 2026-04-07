import express, { Router, type IRouter } from "express";

const router: IRouter = Router();

// ── Production base URL ────────────────────────────────────────────────────
// In production REPLIT_DOMAINS = "node-runner-mustafaalshlany.replit.app"
// In dev it returns a picard.replit.dev preview domain — always use .replit.app
const rawDomain = process.env.REPLIT_DOMAINS?.split(",")[0].trim() ?? "";
const BASE = rawDomain.endsWith(".replit.app")
  ? `https://${rawDomain}`
  : "https://node-runner-mustafaalshlany.replit.app";

// ── Solid-green PNG icons (#107C41) inlined as base64 ──────────────────────
// Sizes: 16, 32, 64, 80  (64 added per Office Store guidelines)
const ICONS: Record<number, Buffer> = {
  16: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFklEQVR4nGMQqHEkCTGMahjVMHw1AADMZ80BM+8p9QAAAABJRU5ErkJggg==", "base64"),
  32: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGMQqHGkKWIYtWDUglELRi0YtWDUglELRi0YtWDUglELhooFAKtlNC4rgYGEAAAAAElFTkSuQmCC", "base64"),
  64: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAFSDNYfAAAAWklEQVR4nO3OMQkAMAxFwV8HVmAFd2AFe2AFdmAFVmAFVmAFVmAFVmAFVmAFbOABDmAADmAADmAADmAADmAADmAADmAADmAADmAADmAADmAADmAADmAADmAADuABDuAB6LcGFVGWFtIAAAAASUVORK5CYII=", "base64"),
  80: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAdUlEQVR4nO3PAQkAIBDAQCNYyV6GN4awP1iA3dr3jGp9PwAGBgYGBgYeE3A94HrA9YDrAdcDrgdcD7gecD3gesD1gOsB1wOuB1wPuB5wPeB6wPWA6wHXA64HXA+4HnA94HrA9YDrAdcDrgdcD7gecD3gesD1Hvh9Bi2KaNKpAAAAAElFTkSuQmCC", "base64"),
};

// ── Manifest XML — Production Final Version ────────────────────────────────
function buildManifest(): string {
  const icon = (size: number) => `${BASE}/api/addin/icon-${size}.png`;
  const appUrl = `${BASE}/excel-addin/`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<OfficeApp
  xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
  xmlns:ov="http://schemas.microsoft.com/office/taskpaneappversionoverrides"
  xsi:type="TaskPaneApp">

  <!--
    ╔══════════════════════════════════════════════════════════════╗
    ║   SniperSheet Excel Add-in  ·  Manifest v1.1  PRODUCTION    ║
    ║   Provider  : Mustafa Alsahlany                              ║
    ║   Add-in ID : 676b34f8-2a49-4066-8bbe-d3aabc46719d          ║
    ║   Version   : 1.0.0.0                                        ║
    ║   Locale    : ar-SA (primary)  en-US (fallback)              ║
    ║   Permission: ReadWriteDocument                              ║
    ╚══════════════════════════════════════════════════════════════╝
  -->

  <Id>676b34f8-2a49-4066-8bbe-d3aabc46719d</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Mustafa Alsahlany</ProviderName>

  <!-- Default locale: Arabic (Saudi Arabia) for full RTL support -->
  <DefaultLocale>ar-SA</DefaultLocale>

  <!-- Display name with Arabic primary + English fallback -->
  <DisplayName DefaultValue="SniperSheet: AI Formula Engine">
    <bt:Override Locale="ar-SA" Value="سنابيرشيت: محرك المعادلات الذكي" />
    <bt:Override Locale="en-US" Value="SniperSheet: AI Formula Engine" />
  </DisplayName>

  <!-- Description with Arabic primary + English fallback -->
  <Description DefaultValue="Advanced AI-powered Excel add-in for engineering and financial formulas. Developed by Mustafa Alsahlany.">
    <bt:Override Locale="ar-SA" Value="إضافة إكسل الاحترافية المدعومة بالذكاء الاصطناعي لتوليد المعادلات الهندسية والمالية من اللغة الطبيعية. تطوير مصطفى السهلاني." />
    <bt:Override Locale="en-US" Value="Advanced AI-powered Excel add-in for engineering and financial formulas. Developed by Mustafa Alsahlany." />
  </Description>

  <!-- Icons: 32px standard · 80px high-resolution -->
  <IconUrl DefaultValue="${icon(32)}" />
  <HighResolutionIconUrl DefaultValue="${icon(80)}" />
  <SupportUrl DefaultValue="${appUrl}" />

  <!-- Trusted domain -->
  <AppDomains>
    <AppDomain>${BASE}</AppDomain>
  </AppDomains>

  <Hosts>
    <Host Name="Workbook" />
  </Hosts>

  <DefaultSettings>
    <SourceLocation DefaultValue="${appUrl}" />
  </DefaultSettings>

  <!-- ReadWriteDocument: AI can write formulas directly into cells -->
  <Permissions>ReadWriteDocument</Permissions>

  <!-- ════════════════════════════════════════════════════════════
       VERSION OVERRIDES — Custom Ribbon tab & button (Excel 2016+)
       Enables the "SniperSheet" tab in the Excel Ribbon with a
       single "Open Sniper Hub" button that opens the task pane.
  ════════════════════════════════════════════════════════════ -->
  <VersionOverrides xmlns="http://schemas.microsoft.com/office/taskpaneappversionoverrides" xsi:type="VersionOverridesV1_0">

    <Hosts>
      <Host xsi:type="Workbook">
        <DesktopFormFactor>

          <FunctionFile resid="Taskpane.Url" />

          <ExtensionPoint xsi:type="PrimaryCommandSurface">
            <CustomTab id="SniperSheet.Tab">
              <Label resid="Tab.Label" />

              <Group id="SniperSheet.Group">
                <Label resid="Group.Label" />

                <Control xsi:type="Button" id="SniperSheet.OpenButton">
                  <Label resid="Button.Label" />
                  <Supertip>
                    <Title resid="Button.Title" />
                    <Description resid="Button.Tooltip" />
                  </Supertip>

                  <!-- Icons: 16px · 32px · 64px · 80px -->
                  <Icon>
                    <bt:Image size="16" resid="Icon.16" />
                    <bt:Image size="32" resid="Icon.32" />
                    <bt:Image size="64" resid="Icon.64" />
                    <bt:Image size="80" resid="Icon.80" />
                  </Icon>

                  <Action xsi:type="ShowTaskpane">
                    <TaskpaneId>SniperSheetPane</TaskpaneId>
                    <SourceLocation resid="Taskpane.Url" />
                    <Title resid="Taskpane.Title" />
                    <SupportedDeviceFormFactor>Desktop</SupportedDeviceFormFactor>
                  </Action>
                </Control>

              </Group>
            </CustomTab>
          </ExtensionPoint>

        </DesktopFormFactor>
      </Host>
    </Hosts>

    <Resources>

      <!-- Icon assets: 16 · 32 · 64 · 80 px (all served from /api/addin/) -->
      <bt:Images>
        <bt:Image id="Icon.16" DefaultValue="${icon(16)}" />
        <bt:Image id="Icon.32" DefaultValue="${icon(32)}" />
        <bt:Image id="Icon.64" DefaultValue="${icon(64)}" />
        <bt:Image id="Icon.80" DefaultValue="${icon(80)}" />
      </bt:Images>

      <!-- Task pane source URL -->
      <bt:Urls>
        <bt:Url id="Taskpane.Url" DefaultValue="${appUrl}" />
      </bt:Urls>

      <!-- Short UI strings (Ribbon labels) — Arabic primary, English fallback -->
      <bt:ShortStrings>
        <bt:String id="Tab.Label" DefaultValue="SniperSheet">
          <bt:Override Locale="ar-SA" Value="سنابيرشيت" />
          <bt:Override Locale="en-US" Value="SniperSheet" />
        </bt:String>

        <bt:String id="Group.Label" DefaultValue="أدوات ذكية">
          <bt:Override Locale="ar-SA" Value="أدوات ذكية" />
          <bt:Override Locale="en-US" Value="Smart Tools" />
        </bt:String>

        <bt:String id="Button.Label" DefaultValue="فتح المحرك الذكي">
          <bt:Override Locale="ar-SA" Value="فتح المحرك الذكي" />
          <bt:Override Locale="en-US" Value="Open Sniper Hub" />
        </bt:String>

        <bt:String id="Button.Title" DefaultValue="SniperSheet: AI Formula Engine">
          <bt:Override Locale="ar-SA" Value="سنابيرشيت: محرك المعادلات الذكي" />
          <bt:Override Locale="en-US" Value="SniperSheet: AI Formula Engine" />
        </bt:String>

        <bt:String id="Taskpane.Title" DefaultValue="SniperSheet">
          <bt:Override Locale="ar-SA" Value="سنابيرشيت" />
          <bt:Override Locale="en-US" Value="SniperSheet" />
        </bt:String>
      </bt:ShortStrings>

      <!-- Tooltip (long string) — Arabic primary, English fallback -->
      <bt:LongStrings>
        <bt:String id="Button.Tooltip" DefaultValue="افتح محرك سنابيرشيت الذكي لتوليد معادلات إكسل من اللغة الطبيعية بالعربية أو الإنجليزية.">
          <bt:Override Locale="ar-SA" Value="افتح محرك سنابيرشيت الذكي لتوليد معادلات إكسل من اللغة الطبيعية بالعربية أو الإنجليزية." />
          <bt:Override Locale="en-US" Value="Open SniperSheet AI engine to generate Excel formulas from English or Arabic natural language descriptions." />
        </bt:String>
      </bt:LongStrings>

    </Resources>

  </VersionOverrides>

</OfficeApp>`;
}

// ── Serve manifest.xml ──────────────────────────────────────────────────────
router.get("/manifest.xml", (_req, res): void => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="manifest.xml"');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.send(buildManifest());
});

// ── Serve PNG icons ─────────────────────────────────────────────────────────
function serveIcon(size: 16 | 32 | 80) {
  return (_req: express.Request, res: express.Response): void => {
    const icon = ICONS[size];
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", icon.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(icon);
  };
}

router.get("/icon-16.png", serveIcon(16));
router.get("/icon-32.png", serveIcon(32));
router.get("/icon-64.png", serveIcon(64));
router.get("/icon-80.png", serveIcon(80));

export default router;
