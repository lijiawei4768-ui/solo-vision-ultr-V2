// tokens/spacing.js — Visual Reset v7b
// HEIGHT.focusCardMobile and fretboardMobile increased to fill typical viewport.
export const SPACING = {
  fretDeckPadTop:0, fretDeckPadBottom:0, fretDeckPadLeft:0, fretDeckPadRight:0,
  focusCardPadMobile:16, focusCardPadTablet:20, focusCardPadPc:20,
  handleWidth:30, handleHeight:3, handleRadius:2,
  l1CardGap:8, l1RowGap:8, l1SectionPadding:4,
  spaceGridCellMobile:26, spaceGridCellTablet:22, spaceGridGap:4,
  l3HeaderHeight:52, l3FooterHeight:56,
  topRailHeightMobile:50, topRailHeightTablet:56,
  tabBarHeightMobile:60, tabBarHeightTablet:68,
  pcToolbarHeight:52,
  modeCapsuleHeightMobile:36, modeCapsuleHeightTablet:40, modeCapsuleHeightPc:38,
  positionStripHeightMobile:18, positionStripHeightTablet:20,
  bottomStatusHeightMobile:56, bottomStatusHeightTablet:60, bottomStatusHeightPc:52,
  pcStageMaxWidth:680,
  ipadPanelWidthPortrait:220, ipadPanelWidthLandscape:240,
  pcPanelWidth:200, l2PanelWidth:300,
  flowL2SettleDelayMs:100,
  spacerAMin:6, spacerAMax:24,
  spacerBMin:8, spacerBMax:8,
  spacerAMinTablet:12, spacerAMaxTablet:36,
  spacerBMinTablet:10, spacerBMaxTablet:28,
  spacerAMinPcL:4, spacerAMaxPcL:16,
  spacerBMinPcL:4, spacerBMaxPcL:12,
  spacerAMinPc:16, spacerAMaxPc:40,
};

export const HEIGHT = {
  focusCardMobile:  'clamp(210px, 33dvh, 275px)',
  fretboardMobile:  'clamp(155px, 25dvh, 210px)',
  focusCardTabletP: 'clamp(210px, 26dvh, 280px)',
  fretboardTabletP: 'clamp(150px, 18dvh, 200px)',
  focusCardTabletL: 'clamp(160px, 24dvh, 210px)',
  fretboardTabletL: 'clamp(120px, 17dvh, 155px)',
  focusCardPc:      'clamp(200px, 28vh,  260px)',
  fretboardPc:      'clamp(140px, 18vh,  180px)',
};
