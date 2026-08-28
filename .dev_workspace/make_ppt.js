const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

function addHeader(slide, title, links) {
    slide.addText("Nexus Tracker", { x: 0.5, y: 0.3, w: 2, h: 0.5, fontSize: 18, bold: true, color: '363636' });
    slide.addText(links, { x: 3, y: 0.3, w: 6, h: 0.5, fontSize: 14, color: '666666', align: 'right' });
    slide.addShape(pres.ShapeType.line, { x: 0.5, y: 0.9, w: 9, h: 0, line: { color: 'CCCCCC', width: 1 } });
    slide.addText(title, { x: 0.5, y: 1.1, w: 9, h: 0.5, fontSize: 24, bold: true, color: '003366' });
}

function addFooter(slide) {
    slide.addShape(pres.ShapeType.line, { x: 0.5, y: 5.0, w: 9, h: 0, line: { color: 'CCCCCC', width: 1 } });
    slide.addText("Footer - Copyright © 2026 Nexus", { x: 0.5, y: 5.1, w: 9, h: 0.3, fontSize: 10, color: '999999', align: 'center' });
}

// 1. Client Welcome
let slide1 = pres.addSlide();
addHeader(slide1, "Client Page 1: Welcome (index)", "");
slide1.addShape(pres.ShapeType.rect, { x: 1, y: 1.8, w: 8, h: 2, fill: '222222' });
slide1.addText("N E X U S", { x: 1, y: 2.2, w: 8, h: 0.5, align: 'center', fontSize: 28, color: '00FFFF', bold: true });
slide1.addShape(pres.ShapeType.rect, { x: 4, y: 3, w: 2, h: 0.4, fill: '0066CC' });
slide1.addText("GET STARTED", { x: 4, y: 3, w: 2, h: 0.4, align: 'center', color: 'FFFFFF', bold: true });
addFooter(slide1);

// 2. Client Catalog
let slide2 = pres.addSlide();
addHeader(slide2, "Client Page 2: Catalog", "[Catalog]  [Search]  [Logbook]  [Contact]");
slide2.addText("Featured Games", { x: 1, y: 1.8, w: 8, h: 0.3, fontSize: 14, bold: true });
for(let i=0; i<4; i++) {
    slide2.addShape(pres.ShapeType.rect, { x: 1 + (i*2), y: 2.2, w: 1.8, h: 1.2, fill: 'F5F5F5', line: { color: 'DDDDDD' } });
    slide2.addText(`Game ${i+1}\n(Image)`, { x: 1 + (i*2), y: 2.2, w: 1.8, h: 1.2, align: 'center', fontSize: 12, color: '666666' });
}
addFooter(slide2);

// 3. Client Search
let slide3 = pres.addSlide();
addHeader(slide3, "Client Page 3: Search", "[Catalog]  [Search]  [Logbook]  [Contact]");
slide3.addShape(pres.ShapeType.rect, { x: 1, y: 1.8, w: 6, h: 0.4, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide3.addText("Enter game title, genre...", { x: 1.1, y: 1.8, w: 5.8, h: 0.4, color: '999999', fontSize: 12, valign: 'middle' });
slide3.addShape(pres.ShapeType.rect, { x: 7.2, y: 1.8, w: 1.8, h: 0.4, fill: '0066CC' });
slide3.addText("SEARCH", { x: 7.2, y: 1.8, w: 1.8, h: 0.4, color: 'FFFFFF', align: 'center', bold: true, fontSize: 12, valign: 'middle' });
slide3.addText("Filters: [ ] Action  [ ] RPG  [ ] Strategy", { x: 1, y: 2.4, w: 8, h: 0.3, fontSize: 12, color: '333333' });
slide3.addShape(pres.ShapeType.rect, { x: 1, y: 2.9, w: 8, h: 0.8, fill: 'F9F9F9', line: { color: 'DDDDDD' } });
slide3.addText("[IMG] Title: Cyber-Odyssey | Platform: PC | Year: 2026", { x: 1.1, y: 2.9, w: 7.8, h: 0.8, fontSize: 14, valign: 'middle' });
addFooter(slide3);

// 4. Client Logbook
let slide4 = pres.addSlide();
addHeader(slide4, "Client Page 4: Logbook", "[Catalog]  [Search]  [Logbook]  [Contact]");
slide4.addShape(pres.ShapeType.rect, { x: 1, y: 2.0, w: 8, h: 2, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide4.addText("Title                  Platform      Status          Rating     Action", { x: 1.1, y: 2.1, w: 7.8, h: 0.3, bold: true, fontSize: 12 });
slide4.addShape(pres.ShapeType.line, { x: 1, y: 2.4, w: 8, h: 0, line: { color: 'CCCCCC' } });
slide4.addText("Final Fantasy          PS5           Playing         5/5        [Edit]", { x: 1.1, y: 2.5, w: 7.8, h: 0.3, fontSize: 12 });
slide4.addText("Halo Infinite          Xbox          Completed       4/5        [Edit]", { x: 1.1, y: 2.9, w: 7.8, h: 0.3, fontSize: 12 });
slide4.addText("Factorio               PC            Backlog         N/A        [Edit]", { x: 1.1, y: 3.3, w: 7.8, h: 0.3, fontSize: 12 });
addFooter(slide4);

// 5. Client Contact
let slide5 = pres.addSlide();
addHeader(slide5, "Client Page 5: Contact", "[Catalog]  [Search]  [Logbook]  [Contact]");
slide5.addText("Contact Support", { x: 1, y: 1.8, w: 8, h: 0.4, fontSize: 16, bold: true });
slide5.addText("Name:", { x: 1, y: 2.3, w: 1.5, h: 0.4, fontSize: 12 });
slide5.addShape(pres.ShapeType.rect, { x: 2.5, y: 2.3, w: 5, h: 0.4, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide5.addText("Email:", { x: 1, y: 2.8, w: 1.5, h: 0.4, fontSize: 12 });
slide5.addShape(pres.ShapeType.rect, { x: 2.5, y: 2.8, w: 5, h: 0.4, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide5.addText("Message:", { x: 1, y: 3.3, w: 1.5, h: 0.4, fontSize: 12 });
slide5.addShape(pres.ShapeType.rect, { x: 2.5, y: 3.3, w: 5, h: 1.2, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide5.addShape(pres.ShapeType.rect, { x: 2.5, y: 4.6, w: 1.5, h: 0.4, fill: '0066CC' });
slide5.addText("SUBMIT", { x: 2.5, y: 4.6, w: 1.5, h: 0.4, color: 'FFFFFF', align: 'center', bold: true, fontSize: 12, valign: 'middle' });
addFooter(slide5);

// 6. Client Profile
let slide6 = pres.addSlide();
addHeader(slide6, "Client Page 6: Profile", "[Catalog]  [Search]  [Logbook]  [Contact]");
slide6.addShape(pres.ShapeType.rect, { x: 1, y: 1.8, w: 1.5, h: 1.5, fill: 'EAEAEA', line: { color: 'CCCCCC' } });
slide6.addText("Avatar", { x: 1, y: 1.8, w: 1.5, h: 1.5, align: 'center', valign: 'middle', fontSize: 12, color: '666666' });
slide6.addText("User: PlayerOne", { x: 2.8, y: 1.8, w: 4, h: 0.4, fontSize: 16, bold: true });
slide6.addText("Total Games: 142", { x: 2.8, y: 2.3, w: 4, h: 0.4, fontSize: 12 });
slide6.addText("Hours Played: 5,420", { x: 2.8, y: 2.7, w: 4, h: 0.4, fontSize: 12 });
slide6.addShape(pres.ShapeType.rect, { x: 1, y: 3.5, w: 8, h: 1.3, fill: 'F9F9F9', line: { color: 'DDDDDD' } });
slide6.addText("Favorite Genres Chart Placeholder", { x: 1, y: 3.5, w: 8, h: 1.3, align: 'center', valign: 'middle', fontSize: 14, color: '999999' });
addFooter(slide6);

// 7. Client Login
let slide7 = pres.addSlide();
addHeader(slide7, "Client Page 7: Login", "[Catalog]  [Search]  [Logbook]  [Contact]");
slide7.addShape(pres.ShapeType.rect, { x: 2.5, y: 2, w: 2, h: 2, fill: 'F5F5F5', line: { color: 'CCCCCC' } });
slide7.addText("Sign In\n[Username]\n[Password]\n[LOGIN]", { x: 2.5, y: 2.5, w: 2, h: 1, align: 'center', fontSize: 12 });
slide7.addShape(pres.ShapeType.rect, { x: 5.5, y: 2, w: 2, h: 2, fill: 'F5F5F5', line: { color: 'CCCCCC' } });
slide7.addText("Sign Up\n[Username]\n[Password]\n[REGISTER]", { x: 5.5, y: 2.5, w: 2, h: 1, align: 'center', fontSize: 12 });
addFooter(slide7);

// Admin Helper
function addAdminHeader(slide, title) {
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.8, fill: '222222' });
    slide.addText("Nexus ADMIN", { x: 0.5, y: 0.15, w: 2, h: 0.5, fontSize: 16, bold: true, color: 'FFFFFF' });
    slide.addText("[Dashboard] [Games] [Users] [Analytics] [Inbox] [Logs] [Settings]", { x: 3, y: 0.15, w: 6.5, h: 0.5, fontSize: 11, color: 'CCCCCC', align: 'right' });
    slide.addText(title, { x: 0.5, y: 1.0, w: 9, h: 0.5, fontSize: 20, bold: true, color: '000000' });
}

// 8. Admin Dashboard
let slide8 = pres.addSlide();
addAdminHeader(slide8, "Admin Page 1: Dashboard");
slide8.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.8, w: 2.5, h: 1.2, fill: 'EFEFEF', line: { color: 'CCCCCC' } });
slide8.addText("Total Games\n1,204", { x: 0.5, y: 1.8, w: 2.5, h: 1.2, align: 'center', valign: 'middle', fontSize: 14, bold: true });
slide8.addShape(pres.ShapeType.rect, { x: 3.5, y: 1.8, w: 2.5, h: 1.2, fill: 'EFEFEF', line: { color: 'CCCCCC' } });
slide8.addText("Active Users\n342", { x: 3.5, y: 1.8, w: 2.5, h: 1.2, align: 'center', valign: 'middle', fontSize: 14, bold: true });
slide8.addShape(pres.ShapeType.rect, { x: 6.5, y: 1.8, w: 2.5, h: 1.2, fill: 'EFEFEF', line: { color: 'CCCCCC' } });
slide8.addText("Server Status\nOnline", { x: 6.5, y: 1.8, w: 2.5, h: 1.2, align: 'center', valign: 'middle', fontSize: 14, bold: true });
addFooter(slide8);

// 9. Admin Games
let slide9 = pres.addSlide();
addAdminHeader(slide9, "Admin Page 2: Games Management");
slide9.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.8, w: 8.5, h: 2, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide9.addText("ID     Title                     Genre       Platform      Actions", { x: 0.6, y: 1.9, w: 8.3, h: 0.3, bold: true, fontSize: 12 });
slide9.addShape(pres.ShapeType.line, { x: 0.5, y: 2.3, w: 8.5, h: 0, line: { color: 'CCCCCC' } });
slide9.addText("1      Cyber-Odyssey             Action      PC, PS5       [Edit] [Del]", { x: 0.6, y: 2.4, w: 8.3, h: 0.3, fontSize: 12 });
addFooter(slide9);

// 10. Admin Users
let slide10 = pres.addSlide();
addAdminHeader(slide10, "Admin Page 3: Users Management");
slide10.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.8, w: 8.5, h: 2, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide10.addText("UID    Username                  Role        Last Login    Actions", { x: 0.6, y: 1.9, w: 8.3, h: 0.3, bold: true, fontSize: 12 });
slide10.addShape(pres.ShapeType.line, { x: 0.5, y: 2.3, w: 8.5, h: 0, line: { color: 'CCCCCC' } });
slide10.addText("101    PlayerOne                 Member      Today         [Edit] [Ban]", { x: 0.6, y: 2.4, w: 8.3, h: 0.3, fontSize: 12 });
addFooter(slide10);

// 11. Admin Analytics
let slide11 = pres.addSlide();
addAdminHeader(slide11, "Admin Page 4: Analytics");
slide11.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.8, w: 8.5, h: 2.5, fill: 'F9F9F9', line: { color: 'DDDDDD' } });
slide11.addText("Traffic Chart (Last 7 Days) Placeholder", { x: 0.5, y: 2.5, w: 8.5, h: 0.5, align: 'center', fontSize: 16, color: '999999' });
addFooter(slide11);

// 12. Admin Inbox
let slide12 = pres.addSlide();
addAdminHeader(slide12, "Admin Page 5: Support Inbox");
slide12.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.8, w: 8.5, h: 2, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide12.addText("Operative              Channel               Transmission", { x: 0.6, y: 1.9, w: 8.3, h: 0.3, bold: true, fontSize: 12 });
slide12.addShape(pres.ShapeType.line, { x: 0.5, y: 2.3, w: 8.5, h: 0, line: { color: 'CCCCCC' } });
slide12.addText("Jazzu                  jazz@email.com        I need help...", { x: 0.6, y: 2.4, w: 8.3, h: 0.3, fontSize: 12 });
addFooter(slide12);

// 13. Admin Logs
let slide13 = pres.addSlide();
addAdminHeader(slide13, "Admin Page 6: Audit Logs");
slide13.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.8, w: 8.5, h: 2, fill: 'FFFFFF', line: { color: 'CCCCCC' } });
slide13.addText("Timestamp            Event                              Severity", { x: 0.6, y: 1.9, w: 8.3, h: 0.3, bold: true, fontSize: 12 });
slide13.addShape(pres.ShapeType.line, { x: 0.5, y: 2.3, w: 8.5, h: 0, line: { color: 'CCCCCC' } });
slide13.addText("2026-08-25 10:45     System Initialized                 INFO", { x: 0.6, y: 2.4, w: 8.3, h: 0.3, fontSize: 12 });
addFooter(slide13);

// 14. Admin Settings
let slide14 = pres.addSlide();
addAdminHeader(slide14, "Admin Page 7: Settings");
slide14.addText("Site Name:     [ Nexus Tracker ]", { x: 0.5, y: 2.3, w: 4, h: 0.4, fontSize: 12 });
slide14.addText("Admin Email:   [ admin@nexus.local ]", { x: 0.5, y: 2.8, w: 4, h: 0.4, fontSize: 12 });
slide14.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.5, w: 2, h: 0.4, fill: '0066CC' });
slide14.addText("SAVE", { x: 0.5, y: 3.5, w: 2, h: 0.4, color: 'FFFFFF', align: 'center', bold: true, fontSize: 12 });
addFooter(slide14);

pres.writeFile({ fileName: "Project_Wireframes_Proper.pptx" }).then(fileName => {
    console.log(`created file: ${fileName}`);
});
