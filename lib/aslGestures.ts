// ASL A-Z gesture definitions using fingerpose
// fingerpose uses finger curl + direction rules to classify hand poses
// This covers the static ASL alphabet (letters that don't require motion)

import * as fp from 'fingerpose';

const { GestureDescription, Finger, FingerCurl, FingerDirection } = fp;

// ── A ─────────────────────────────────────────────────────────────────────────
const ASign = new GestureDescription('A');
ASign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  ASign.addCurl(f, FingerCurl.FullCurl, 1.0);
});

// ── B ─────────────────────────────────────────────────────────────────────────
const BSign = new GestureDescription('B');
BSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  BSign.addCurl(f, FingerCurl.NoCurl, 1.0);
  BSign.addDirection(f, FingerDirection.VerticalUp, 1.0);
});

// ── C ─────────────────────────────────────────────────────────────────────────
const CSign = new GestureDescription('C');
[Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  CSign.addCurl(f, FingerCurl.HalfCurl, 1.0);
});

// ── D ─────────────────────────────────────────────────────────────────────────
const DSign = new GestureDescription('D');
DSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
DSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  DSign.addCurl(f, FingerCurl.FullCurl, 1.0);
});
DSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// ── E ─────────────────────────────────────────────────────────────────────────
const ESign = new GestureDescription('E');
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  ESign.addCurl(f, FingerCurl.HalfCurl, 1.0);
});
ESign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// ── F ─────────────────────────────────────────────────────────────────────────
const FSign = new GestureDescription('F');
FSign.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
FSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  FSign.addCurl(f, FingerCurl.NoCurl, 1.0);
  FSign.addDirection(f, FingerDirection.VerticalUp, 1.0);
});

// ── L ─────────────────────────────────────────────────────────────────────────
const LSign = new GestureDescription('L');
LSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
LSign.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.5);
LSign.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
LSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
LSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  LSign.addCurl(f, FingerCurl.FullCurl, 1.0);
});

// ── O ─────────────────────────────────────────────────────────────────────────
const OSign = new GestureDescription('O');
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  OSign.addCurl(f, FingerCurl.HalfCurl, 0.8);
  OSign.addDirection(f, FingerDirection.DiagonalUpRight, 0.5);
});
OSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.8);

// ── V ─────────────────────────────────────────────────────────────────────────
const VSign = new GestureDescription('V');
VSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
VSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
VSign.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
VSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
[Finger.Ring, Finger.Pinky].forEach(f => {
  VSign.addCurl(f, FingerCurl.FullCurl, 1.0);
});
VSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);

// ── W ─────────────────────────────────────────────────────────────────────────
const WSign = new GestureDescription('W');
[Finger.Index, Finger.Middle, Finger.Ring].forEach(f => {
  WSign.addCurl(f, FingerCurl.NoCurl, 1.0);
  WSign.addDirection(f, FingerDirection.VerticalUp, 1.0);
});
WSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
WSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);

// ── Y ─────────────────────────────────────────────────────────────────────────
const YSign = new GestureDescription('Y');
YSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
YSign.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, 0.5);
YSign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
YSign.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 0.5);
[Finger.Index, Finger.Middle, Finger.Ring].forEach(f => {
  YSign.addCurl(f, FingerCurl.FullCurl, 1.0);
});

// Export all gesture definitions
export const ASL_GESTURES = [
  ASign, BSign, CSign, DSign, ESign, FSign,
  LSign, OSign, VSign, WSign, YSign
];

export const ALL_GESTURE_NAMES = ASL_GESTURES.map(g => g.name);
