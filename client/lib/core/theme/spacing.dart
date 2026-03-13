import 'package:flutter/widgets.dart';

class AppSpacing {
  // Numerical scale map (from px)
  static const double p1 = 4.0;
  static const double p2 = 8.0;
  static const double p3 = 12.0;
  static const double p4 = 16.0;
  static const double p5 = 20.0;
  static const double p6 = 24.0;
  static const double p8 = 32.0;
  static const double p10 = 40.0;
  static const double p12 = 48.0;
  static const double p16 = 64.0;

  // Semantic t-shirt scale
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;
  static const double xxxxl = 40.0;

  // Radii
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 20.0;
  static const double radiusFull = 9999.0;
}

class AppShadows {
  static const List<BoxShadow> sm = [
    BoxShadow(color: Color(0x0D000000), offset: Offset(0, 1), blurRadius: 2),
  ];
  static const List<BoxShadow> md = [
    BoxShadow(color: Color(0x1A000000), offset: Offset(0, 1), blurRadius: 3),
    BoxShadow(color: Color(0x1A000000), offset: Offset(0, 1), blurRadius: 2, spreadRadius: -1),
  ];
  static const List<BoxShadow> lg = [
    BoxShadow(color: Color(0x1A000000), offset: Offset(0, 4), blurRadius: 6, spreadRadius: -1),
    BoxShadow(color: Color(0x1A000000), offset: Offset(0, 2), blurRadius: 4, spreadRadius: -2),
  ];
}
