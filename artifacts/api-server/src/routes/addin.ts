import express, { Router, type IRouter } from "express";

const router: IRouter = Router();

const BASE = "https://8e832e48-8f9e-4168-9828-29c19ce7accc-00-12f81e1kjeof1.picard.replit.dev";

// ── Solid-green PNG icons (#107C41) inlined as base64 ──────────────────────
const ICONS: Record<number, Buffer> = {
  16: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFklEQVR4nGMQqHEkCTGMahjVMHw1AADMZ80BM+8p9QAAAABJRU5ErkJggg==", "base64"),
  32: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGMQqHGkKWIYtWDUglELRi0YtWDUglELRi0YtWDUglELhooFAKtlNC4rgYGEAAAAAElFTkSuQmCC", "base64"),
  80: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAdUlEQVR4nO3PAQkAIBDAQCNYyV6GN4awP1iA3dr3jGp9PwAGBgYGBgYeE3A94HrA9YDrAdcDrgdcD7gecD3gesD1gOsB1wOuB1wPuB5wPeB6wPWA6wHXA64HXA+4HnA94HrA9YDrAdcDrgdcD7gecD3gesD1Hvh9Bi2KaNKpAAAAAElFTkSuQmCC", "base64"),
};

// ── Manifest XML (generated, all URLs point to this API server) ────────────
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

  <!-- ═══════════════════════════════════════════════════════════
       SniperSheet Excel Add-in  ·  Manifest v1.1
       Provider : Mustafa Alsahlany
       Add-in ID: 676b34f8-2a49-4066-8bbe-d3aabc46719d
  ═══════════════════════════════════════════════════════════ -->

  <Id>676b34f8-2a49-4066-8bbe-d3aabc46719d</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Mustafa Alsahlany</ProviderName>
  <DefaultLocale>ar-SA</DefaultLocale>

  <DisplayName DefaultValue="SniperSheet" />
  <Description DefaultValue="محرك ذكاء اصطناعي متقدم لتوليد معادلات Excel من اللغة الطبيعية للمهندسين والمحللين. An advanced AI-powered logic engine for engineers to generate Excel formulas from natural language." />

  <IconUrl DefaultValue="${icon(32)}" />
  <HighResolutionIconUrl DefaultValue="${icon(80)}" />
  <SupportUrl DefaultValue="${appUrl}" />

  <AppDomains>
    <AppDomain>${BASE}</AppDomain>
  </AppDomains>

  <Hosts>
    <Host Name="Workbook" />
  </Hosts>

  <DefaultSettings>
    <SourceLocation DefaultValue="${appUrl}" />
  </DefaultSettings>

  <!-- ReadWriteDocument: full read/write access to the active sheet -->
  <Permissions>ReadWriteDocument</Permissions>

  <!-- ═══════════════════════════════════════════════════════════
       VERSION OVERRIDES — Custom Ribbon tab & button (Excel 2016+)
  ═══════════════════════════════════════════════════════════ -->
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

                  <Icon>
                    <bt:Image size="16" resid="Icon.16" />
                    <bt:Image size="32" resid="Icon.32" />
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
      <bt:Images>
        <bt:Image id="Icon.16" DefaultValue="${icon(16)}" />
        <bt:Image id="Icon.32" DefaultValue="${icon(32)}" />
        <bt:Image id="Icon.80" DefaultValue="${icon(80)}" />
      </bt:Images>

      <bt:Urls>
        <bt:Url id="Taskpane.Url" DefaultValue="${appUrl}" />
      </bt:Urls>

      <bt:ShortStrings>
        <bt:String id="Tab.Label"       DefaultValue="SniperSheet" />
        <bt:String id="Group.Label"     DefaultValue="Smart Tools / أدوات ذكية" />
        <bt:String id="Button.Label"    DefaultValue="Open Sniper Hub" />
        <bt:String id="Button.Title"    DefaultValue="SniperSheet — AI Formula Engine" />
        <bt:String id="Taskpane.Title"  DefaultValue="SniperSheet" />
      </bt:ShortStrings>

      <bt:LongStrings>
        <bt:String id="Button.Tooltip" DefaultValue="افتح محرك SniperSheet الذكي لتوليد معادلات Excel من اللغة الطبيعية بالعربية أو الإنجليزية. Open SniperSheet AI engine to generate Excel formulas from Arabic or English." />
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
router.get("/icon-80.png", serveIcon(80));

export default router;
