import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';

class _HoverPopoutCard extends StatefulWidget {
  final Widget child;
  const _HoverPopoutCard({required this.child});

  @override
  State<_HoverPopoutCard> createState() => _HoverPopoutCardState();
}

class _FooterItem {
  final String label;
  final String? path;
  final VoidCallback? onTap;

  _FooterItem(this.label, {this.path, this.onTap});
}

class _FooterLink extends StatefulWidget {
  final _FooterItem item;
  const _FooterLink({required this.item});

  @override
  State<_FooterLink> createState() => _FooterLinkState();
}

class _FooterLinkState extends State<_FooterLink> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: InkWell(
        onTap: () {
          if (widget.item.onTap != null) {
            widget.item.onTap!();
          } else if (widget.item.path != null) {
            context.go(widget.item.path!);
          }
        },
        borderRadius: BorderRadius.circular(4),
        child: AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 200),
          style: TextStyle(
            fontSize: 14,
            color: _isHovered
                ? const Color(0xFF059669)
                : const Color(0xFF757575),
            fontWeight: _isHovered ? FontWeight.w600 : FontWeight.w400,
          ),
          child: Text(widget.item.label),
        ),
      ),
    );
  }
}

class _HoverPopoutCardState extends State<_HoverPopoutCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        transform: Matrix4.diagonal3Values(
          _isHovered ? 1.02 : 1.0,
          _isHovered ? 1.02 : 1.0,
          1.0,
        ),
        transformAlignment: Alignment.center,
        decoration: BoxDecoration(
          boxShadow: [
            if (_isHovered)
              BoxShadow(
                color: const Color(0xFF059669).withValues(alpha: 0.1),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
          ],
        ),
        child: widget.child,
      ),
    );
  }
}

class WebLandingScreen extends StatefulWidget {
  const WebLandingScreen({super.key});

  @override
  State<WebLandingScreen> createState() => _WebLandingScreenState();
}

class _WebLandingScreenState extends State<WebLandingScreen> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _featuresKey = GlobalKey();
  final GlobalKey _howItWorksKey = GlobalKey();
  final GlobalKey _pricingKey = GlobalKey();

  bool _scrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(() {
      if (_scrollController.offset > 20 && !_scrolled) {
        setState(() => _scrolled = true);
      } else if (_scrollController.offset <= 20 && _scrolled) {
        setState(() => _scrolled = false);
      }
    });
  }

  void scrollToSection(GlobalKey key) {
    final context = key.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(seconds: 1),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 768;

    return Scaffold(
      backgroundColor: Colors.white,
      extendBodyBehindAppBar: true,
      appBar: _buildNavBar(context, isDesktop),
      endDrawer: !isDesktop ? _buildMobileDrawer(context) : null,
      body: SingleChildScrollView(
        controller: _scrollController,
        child: Column(
          children: [
            _buildHero(context, isDesktop),
            _buildStatsBar(context, isDesktop),
            _buildFeatures(context, isDesktop),
            _buildHowItWorks(context, isDesktop),
            _buildDashboardPreview(context, isDesktop),
            _buildForDrivers(context, isDesktop),
            _buildTestimonials(context, isDesktop),
            _buildPricing(context, isDesktop),
            _buildCTABanner(context, isDesktop),
            _buildFooter(context, isDesktop),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildNavBar(BuildContext context, bool isDesktop) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(64),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: _scrolled ? 0.95 : 0.0),
          border: Border(
            bottom: BorderSide(
              color: _scrolled
                  ? Colors.black.withValues(alpha: 0.06)
                  : Colors.transparent,
            ),
          ),
        ),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(
              sigmaX: _scrolled ? 12 : 0,
              sigmaY: _scrolled ? 12 : 0,
            ),
            child: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              centerTitle: true,
              title: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1440),
                child: Row(
                  children: [
                    // Logo
                    InkWell(
                      onTap: () => context.go('/'),
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF059669), Color(0xFF047857)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.local_shipping,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'VECTOR',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.5,
                              color: Color(0xFF121212),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isDesktop) ...[
                      const Spacer(),
                      _navLink('Features', onTap: () => scrollToSection(_featuresKey)),
                      const SizedBox(width: 32),
                      _navLink('How it works', onTap: () => scrollToSection(_howItWorksKey)),
                      const SizedBox(width: 32),
                      _navLink('Pricing', onTap: () => scrollToSection(_pricingKey)),
                      const SizedBox(width: 32),
                      // Desktop CTAs
                      _buildHeaderButton(
                        label: 'Sign in',
                        onPressed: () => context.go('/dashboard/signin'),
                        isPrimary: false,
                      ),
                      const SizedBox(width: 12),
                      _buildHeaderButton(
                        label: 'Get started',
                        onPressed: () => context.go('/dashboard/signup'),
                        isPrimary: true,
                      ),
                    ],
                  ],
                ),
              ),
              automaticallyImplyLeading: false,
              actions: [
                if (!isDesktop)
                  Builder(
                    builder: (context) => Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: IconButton(
                        icon: const Icon(Icons.menu, color: Color(0xFF212121)),
                        onPressed: () => Scaffold.of(context).openEndDrawer(),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderButton({
    required String label,
    required VoidCallback onPressed,
    required bool isPrimary,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        decoration: BoxDecoration(
          color: isPrimary ? const Color(0xFF059669) : Colors.transparent,
          border: isPrimary
              ? null
              : Border.all(color: Colors.black.withValues(alpha: 0.12)),
          borderRadius: BorderRadius.circular(8),
          boxShadow: isPrimary
              ? [
                  BoxShadow(
                    color: const Color(0xFF059669).withValues(alpha: 0.3),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isPrimary ? Colors.white : const Color(0xFF212121),
          ),
        ),
      ),
    );
  }

  Widget _navLink(String label, {VoidCallback? onTap, String? path}) {
    return InkWell(
      onTap: () {
        if (onTap != null) {
          onTap();
        } else if (path != null) {
          context.go(path);
        }
      },
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF757575),
        ),
      ),
    );
  }

  Widget _buildMobileDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      width: 280,
      elevation: 0,
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF212121)),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                children: [
                  _mobileNavItem(context, 'Features', onTap: () => scrollToSection(_featuresKey)),
                  const SizedBox(height: 20),
                  _mobileNavItem(context, 'How it works', onTap: () => scrollToSection(_howItWorksKey)),
                  const SizedBox(height: 20),
                  _mobileNavItem(context, 'Pricing', onTap: () => scrollToSection(_pricingKey)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Divider(color: Color(0x0F000000)),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go('/dashboard/signin'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: Color(0x1F000000)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        foregroundColor: const Color(0xFF212121),
                        textStyle: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      child: const Text('Sign in'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => context.go('/dashboard/signup'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      child: const Text('Get started'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _mobileNavItem(BuildContext context, String label, {VoidCallback? onTap}) {
    return InkWell(
      onTap: () {
        Navigator.pop(context);
        if (onTap != null) onTap();
      },
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Color(0xFF212121),
        ),
      ),
    );
  }

  Widget _buildHero(BuildContext context, bool isDesktop) {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(-0.5, -0.5),
          radius: 1.5,
          colors: [
            Color(0x14059669), // 8% opacity emerald
            Colors.white,
          ],
        ),
      ),
      padding: EdgeInsets.fromLTRB(24, isDesktop ? 160 : 120, 24, 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Wrap(
            spacing: 64,
            runSpacing: 48,
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              // Left content
              SizedBox(
                width: isDesktop ? 550 : double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 28),
                    RichText(
                      text: TextSpan(
                        style: TextStyle(
                          fontSize: isDesktop ? 60 : 36,
                          fontWeight: FontWeight.w800,
                          height: 1.08,
                          letterSpacing: -1.8,
                          color: const Color(0xFF121212),
                        ),
                        children: [
                          const TextSpan(text: 'Route smarter.\n'),
                          WidgetSpan(
                            child: ShaderMask(
                              shaderCallback: (bounds) => const LinearGradient(
                                colors: [Color(0xFF059669), Color(0xFF34D399)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ).createShader(bounds),
                              child: Text(
                                'Deliver faster.',
                                style: TextStyle(
                                  fontSize: isDesktop ? 60 : 36,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'VECTOR is the all-in-one fleet management platform that optimises routes, tracks drivers live, and keeps customers informed — built for local delivery businesses.',
                      style: TextStyle(
                        fontSize: 18,
                        height: 1.65,
                        color: const Color(0xFF757575),
                      ),
                    ),
                    const SizedBox(height: 40),
                            Flex(
                              direction: isDesktop
                                  ? Axis.horizontal
                                  : Axis.vertical,
                              mainAxisSize: MainAxisSize.min,
                      children: [
                                SizedBox(
                                  width: isDesktop ? null : double.infinity,
                                  child: ElevatedButton.icon(
                                    onPressed: () =>
                                        context.go('/dashboard/signup'),
                                    icon: const Text(
                                      'Get started',
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    label: const Icon(
                                      Icons.arrow_forward,
                                      size: 16,
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF059669),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 28,
                                        vertical: 14,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      elevation: 4,
                                      shadowColor: const Color(0x4D059669),
                                    ),
                                  ),
                                ),
                                if (!isDesktop)
                                  const SizedBox(height: 12)
                                else
                                  const SizedBox(width: 12),
                                SizedBox(
                                  width: isDesktop ? null : double.infinity,
                                  child: OutlinedButton.icon(
                                    onPressed: () => context.go('/driver'),
                                    icon: const Icon(
                                      Icons.local_shipping,
                                      size: 16,
                                    ),
                                    label: const Text('Driver app'),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF212121),
                                      side: BorderSide(
                                        color: Colors.black.withValues(
                                          alpha: 0.12,
                                        ),
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 28,
                                        vertical: 14,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      textStyle: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ),
                      ],
                    ),
                    const SizedBox(height: 40),
                    Wrap(
                      spacing: 20,
                      runSpacing: 10,
                      children: [
                        _trustSignal('No credit card required'),
                        _trustSignal('14-day free trial'),
                        _trustSignal('Cancel anytime'),
                      ],
                    ),
                  ],
                ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0, curve: Curves.easeOutCubic),
              ),
              // Right Visual
              SizedBox(
                width: isDesktop ? 650 : double.infinity,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.12),
                            blurRadius: 64,
                            offset: const Offset(0, 24),
                          ),
                        ],
                        border: Border.all(
                          color: Colors.black.withValues(alpha: 0.06),
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: AspectRatio(
                          aspectRatio: 4 / 3,
                          child: Image.asset(
                            'assets/images/landing_page.jpeg',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                    // Floating stats
                    Positioned(
                      bottom: -16,
                      left: -16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 14,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.12),
                              blurRadius: 32,
                              offset: const Offset(0, 8),
                            ),
                          ],
                          border: Border.all(
                            color: Colors.black.withValues(alpha: 0.06),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.trending_up,
                                color: Color(0xFF059669),
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  '40%',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF121212),
                                    height: 1,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Faster deliveries',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey[400],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    Positioned(
                      top: 20,
                      right: -16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.12),
                              blurRadius: 32,
                              offset: const Offset(0, 8),
                            ),
                          ],
                          border: Border.all(
                            color: Colors.black.withValues(alpha: 0.06),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Color(0xFF059669),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Color(0x33059669),
                                    spreadRadius: 3,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              '12 drivers active',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF212121),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ).animate().fadeIn(delay: 200.ms, duration: 600.ms).slideX(begin: 0.1, end: 0, curve: Curves.easeOutCubic),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _trustSignal(String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.check_circle, color: Color(0xFF059669), size: 14),
        const SizedBox(width: 6),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF757575),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildStatsBar(BuildContext context, bool isDesktop) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        border: Border.symmetric(
          horizontal: BorderSide(color: Colors.black.withValues(alpha: 0.06)),
        ),
      ),
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Wrap(
            spacing: 32,
            runSpacing: 32,
            alignment: WrapAlignment.center,
            children: [
              _statItem('10,000+', 'Deliveries optimised daily', isDesktop),
              _statItem('40%', 'Average time saved', isDesktop),
              _statItem('99.9%', 'Platform uptime', isDesktop),
              _statItem('500+', 'Active fleet accounts', isDesktop),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(delay: 400.ms);
  }

  Widget _statItem(String value, String label, bool isDesktop) {
    return SizedBox(
      width: isDesktop ? 220 : 160,
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w800,
              color: Color(0xFF121212),
              letterSpacing: -0.72,
              height: 1,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[400],
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFeatures(BuildContext context, bool isDesktop) {
    return Container(
      key: _featuresKey,
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Column(
            children: [
              _sectionHeader(
                'Features',
                'Everything your fleet needs',
                'From route planning to proof of delivery, VECTOR handles the full delivery lifecycle so you can focus on growth.',
              ),
              const SizedBox(height: 64),
              Wrap(
                spacing: 24,
                runSpacing: 24,
                alignment: WrapAlignment.center,
                children: [
                  SizedBox(
                    width: isDesktop ? 380 : double.infinity,
                    child: _featureCard(
                      Icons.bolt,
                      'AI Route Optimization',
                      'Our engine calculates the fastest routes across hundreds of stops in seconds, saving up to 40% in drive time.',
                    ),
                  ),
                  SizedBox(
                    width: isDesktop ? 380 : double.infinity,
                    child: _featureCard(
                      Icons.location_on,
                      'Live GPS Tracking',
                      'Track every driver on a live map. See ETAs, position, and delivery status updated in real time.',
                    ),
                  ),
                  SizedBox(
                    width: isDesktop ? 380 : double.infinity,
                    child: _featureCard(
                      Icons.assignment_turned_in,
                      'Proof of Delivery',
                      'Drivers capture photos and signatures at each stop. Every delivery is verified and timestamped.',
                    ),
                  ),
                  SizedBox(
                    width: isDesktop ? 380 : double.infinity,
                    child: _featureCard(
                      Icons.notifications_active,
                      'Customer Notifications',
                      'Automatically send customers a tracking link so they know exactly when to expect their delivery.',
                    ),
                  ),
                  SizedBox(
                    width: isDesktop ? 380 : double.infinity,
                    child: _featureCard(
                      Icons.bar_chart,
                      'Fleet Analytics',
                      'Deep reports on performance, fuel cost, on-time rates, and driver efficiency — all in one dashboard.',
                    ),
                  ),
                  SizedBox(
                    width: isDesktop ? 380 : double.infinity,
                    child: _featureCard(
                      Icons.people,
                      'Simple Driver Onboarding',
                      'Drivers get started in seconds with a company code. No complex training or onboarding required.',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _featureCard(IconData icon, String title, String desc) {
    return _HoverPopoutCard(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.black.withValues(alpha: 0.08)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: const Color(0xFF059669), size: 22),
            ),
            const SizedBox(height: 18),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF121212),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              desc,
              style: TextStyle(
                fontSize: 14,
                height: 1.6,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHowItWorks(BuildContext context, bool isDesktop) {
    return Container(
      key: _howItWorksKey,
      color: const Color(0xFFF8FAF9),
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Column(
            children: [
              _sectionHeader(
                'How it works',
                'Up and running in minutes',
                'No complex setup. No IT team required. Your fleet is live and optimised in under an hour.',
              ),
              const SizedBox(height: 64),
              Wrap(
                spacing: 32,
                runSpacing: 32,
                alignment: WrapAlignment.center,
                children: [
                  _stepCard(
                    '01',
                    'Create your fleet account',
                    'Sign up in minutes. Get your unique company code and configure your first fleet.',
                    isDesktop: isDesktop,
                  ),
                  _stepCard(
                    '02',
                    'Add drivers instantly',
                    'Share your company code with drivers. They download the app, enter the code, and they\'re on your fleet.',
                    isDesktop: isDesktop,
                  ),
                  _stepCard(
                    '03',
                    'Build & assign routes',
                    'Create a route, add stops, optimise with one click, then assign it to any driver from the dashboard.',
                    isDesktop: isDesktop,
                  ),
                  _stepCard(
                    '04',
                    'Track, verify & improve',
                    'Monitor deliveries live, receive proof-of-delivery photos, and use analytics to sharpen your operations.',
                    isDesktop: isDesktop,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _stepCard(
    String number,
    String title,
    String desc, {
    bool isDesktop = true,
  }) {
    return _HoverPopoutCard(
      child: Container(
        width: isDesktop ? 280 : double.infinity,
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 32 : 16,
          vertical: isDesktop ? 32 : 24,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.black.withValues(alpha: 0.08)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              number,
              style: const TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.w900,
                color: Color(0xFFECFDF5),
                height: 1,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF121212),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              desc,
              style: TextStyle(
                fontSize: 14,
                height: 1.6,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardPreview(BuildContext context, bool isDesktop) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Wrap(
            spacing: 64,
            runSpacing: 48,
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              SizedBox(
                width: isDesktop ? 500 : double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _badge('Fleet Dashboard'),
                    const SizedBox(height: 20),
                    const Text(
                      'Complete visibility over your entire fleet',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF121212),
                        letterSpacing: -0.64,
                      ),
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'One clean dashboard to manage routes, monitor drivers live, review analytics, and handle billing — without switching between a dozen tools.',
                      style: TextStyle(
                        fontSize: 16,
                        color: Color(0xFF757575),
                        height: 1.7,
                      ),
                    ),
                    const SizedBox(height: 28),
                    _bullet('Assign routes to drivers in seconds'),
                    _bullet('View live GPS positions on a map'),
                    _bullet('Review delivery proof photos & signatures'),
                    _bullet('Export detailed reports for any date range'),
                  ],
                ),
              ),
              Container(
                width: isDesktop ? 600 : double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 64,
                      offset: const Offset(0, 24),
                    ),
                  ],
                  border: Border.all(
                    color: Colors.black.withValues(alpha: 0.06),
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.network(
                    'https://images.unsplash.com/photo-1620662892011-f5c2d523fae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3V0ZSUyMG9wdGltaXphdGlvbiUyMG1hcCUyMHBpbnMlMjBhZXJpYWwlMjBjaXR5fGVufDF8fHx8MTc3Mjc4NDI4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildForDrivers(BuildContext context, bool isDesktop) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF064E3B), Color(0xFF065F46), Color(0xFF047857)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 900),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 5,
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.local_shipping,
                      color: Color(0xFF34D399),
                      size: 14,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'FOR DRIVERS',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF34D399),
                        letterSpacing: 0.6,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Drivers love the mobile app',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.72,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Turn-by-turn navigation, offline mode, proof-of-delivery capture, and instant communication with dispatch — all in one app.',
                style: TextStyle(
                  fontSize: 17,
                  color: Colors.white70,
                  height: 1.65,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 36),
              Flex(
                direction: isDesktop ? Axis.horizontal : Axis.vertical,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: isDesktop ? null : double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => context.go('/driver'),
                      icon: const Icon(Icons.local_shipping, size: 18),
                      label: const Text(
                        'Open driver app',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF34D399),
                        foregroundColor: const Color(0xFF064E3B),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 28,
                          vertical: 14,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                  if (!isDesktop)
                    const SizedBox(height: 12)
                  else
                    const SizedBox(width: 16),
                  SizedBox(
                    width: isDesktop ? null : double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go('/driver'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white24),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 28,
                          vertical: 14,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      child: const Text('Sign up as driver'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'Drivers register using a company code provided by their fleet manager',
                style: TextStyle(fontSize: 13, color: Colors.white38),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTestimonials(BuildContext context, bool isDesktop) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Column(
            children: [
              _sectionHeader(
                'Customer stories',
                'Trusted by delivery teams worldwide',
                '',
              ),
              const SizedBox(height: 56),
              Wrap(
                spacing: 24,
                runSpacing: 24,
                alignment: WrapAlignment.center,
                children: [
                  _testimonialCard(
                    'Marcus Webb',
                    'Operations Manager',
                    'SwiftBox Courier',
                    'VECTOR cut our average delivery time by 35%. The dashboard is incredibly intuitive — our dispatchers were up to speed in a day.',
                  ),
                  _testimonialCard(
                    'Priya Nair',
                    'Founder',
                    'GreenRun Logistics',
                    'We scaled from 3 to 22 drivers without hiring an extra dispatcher. The company code system made onboarding painless.',
                  ),
                  _testimonialCard(
                    'James Okoye',
                    'Fleet Director',
                    'CityLink Deliveries',
                    'The proof-of-delivery feature alone saved us countless disputes. Customers love the real-time tracking link.',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _testimonialCard(
    String name,
    String role,
    String company,
    String text,
  ) {
    return Container(
      width: 340,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(
              5,
              (_) => const Icon(Icons.star, color: Color(0xFFFBBF24), size: 14),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '"$text"',
            style: const TextStyle(
              fontSize: 15,
              color: Color(0xFF424242),
              height: 1.65,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              CircleAvatar(
                radius: 19,
                backgroundColor: const Color(0xFF059669),
                child: Text(
                  name.split(' ').map((n) => n[0]).join(''),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF121212),
                    ),
                  ),
                  Text(
                    '$role, $company',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPricing(BuildContext context, bool isDesktop) {
    return Container(
      color: const Color(0xFFF8FAF9),
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Column(
            children: [
              _sectionHeader(
                'Pricing',
                'Simple, transparent pricing',
                'Start free, scale as you grow. No hidden fees.',
              ),
              const SizedBox(height: 64),
              Wrap(
                spacing: 24,
                runSpacing: 24,
                alignment: WrapAlignment.center,
                crossAxisAlignment: WrapCrossAlignment.start,
                children: [
                  _pricingCard(
                    'Starter',
                    '0',
                    'forever',
                    'Up to 3 drivers',
                    [
                      'AI Route optimization',
                      'Real-time tracking',
                      'Proof of delivery',
                    ],
                    'Choose plan',
                    false,
                    isDesktop: isDesktop,
                  ),
                  _pricingCard(
                    'Pro',
                    '49',
                    'per month',
                    'Up to 10 drivers',
                    [
                      'Everything in Starter',
                      'Customer tracking links',
                      'Email support',
                    ],
                    'Choose plan',
                    false,
                    isDesktop: isDesktop,
                  ),
                  _pricingCard(
                    'Enterprise',
                    'Custom',
                    '',
                    'Unlimited drivers',
                    [
                      'Everything in Pro',
                      'Dedicated manager',
                      'Custom integrations',
                      'SLA guarantee',
                    ],
                    'Contact sales',
                    false,
                    isDesktop: isDesktop,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _pricingCard(
    String name,
    String price,
    String period,
    String drivers,
    List<String> features,
    String cta,
    bool highlighted,
    {
    bool isDesktop = true,
  }
  ) {
    return Container(
      width: isDesktop ? 320 : double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? 32 : 16,
        vertical: isDesktop ? 32 : 24,
      ),
      decoration: BoxDecoration(
        color: highlighted ? const Color(0xFF059669) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: highlighted
            ? null
            : Border.all(color: Colors.black.withValues(alpha: 0.08)),
        boxShadow: highlighted
            ? [
                BoxShadow(
                  color: const Color(0x4D059669),
                  blurRadius: 60,
                  offset: const Offset(0, 20),
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (highlighted) ...[
            Center(
              child: Container(
                margin: const EdgeInsets.only(bottom: 20),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF34D399),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: const Text(
                  'MOST POPULAR',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF064E3B),
                    letterSpacing: 0.6,
                  ),
                ),
              ),
            ),
          ],
          Text(
            name,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: highlighted ? Colors.white70 : Colors.grey,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              if (price != 'Custom')
                Text(
                  '\$',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: highlighted ? Colors.white70 : Colors.grey,
                  ),
                ),
              Text(
                price,
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.w900,
                  color: highlighted ? Colors.white : const Color(0xFF121212),
                  height: 1,
                ),
              ),
              if (period.isNotEmpty)
                Text(
                  period,
                  style: TextStyle(
                    fontSize: 14,
                    color: highlighted ? Colors.white60 : Colors.grey,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            drivers,
            style: TextStyle(
              fontSize: 13,
              color: highlighted ? Colors.white70 : Colors.grey,
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: highlighted
                    ? Colors.white
                    : const Color(0xFF059669),
                foregroundColor: highlighted
                    ? const Color(0xFF059669)
                    : Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                textStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              child: Text(cta),
            ),
          ),
          const SizedBox(height: 24),
          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 15,
                    color: highlighted
                        ? const Color(0xFF34D399)
                        : const Color(0xFF059669),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      f,
                      style: TextStyle(
                        fontSize: 13,
                        color: highlighted
                            ? Colors.white.withValues(alpha: 0.85)
                            : const Color(0xFF757575),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCTABanner(BuildContext context, bool isDesktop) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 900),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 64, horizontal: 40),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFECFDF5), Color(0xFFD1FAE5)],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0x26059669)),
            ),
            child: Column(
              children: [
                const Text(
                  'Ready to optimise your fleet?',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF064E3B),
                    letterSpacing: -0.64,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Join hundreds of delivery businesses already saving time and money with VECTOR. Set up your fleet in under 10 minutes.',
                  style: TextStyle(
                    fontSize: 17,
                    color: Color(0xFF065F46),
                    height: 1.6,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 36),
                Flex(
                  direction: isDesktop ? Axis.horizontal : Axis.vertical,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: isDesktop ? null : double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => context.go('/dashboard/signup'),
                        icon: const Text(
                          'Get started',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        label: const Icon(Icons.arrow_forward, size: 18),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 0,
                        ),
                      ),
                    ),
                    if (!isDesktop)
                      const SizedBox(height: 12)
                    else
                      const SizedBox(width: 16),
                    SizedBox(
                      width: isDesktop ? null : double.infinity,
                      child: OutlinedButton(
                        onPressed: () => context.go('/dashboard/signin'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF059669),
                          side: const BorderSide(color: Color(0x4D059669)),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          'Sign in to dashboard',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context, bool isDesktop) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
      color: const Color(0xFFFAFAFA),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1440),
          child: Column(
            children: [
              Wrap(
                spacing: 40,
                runSpacing: 40,
                alignment: WrapAlignment.spaceBetween,
                children: [
                  SizedBox(
                    width: 200,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF059669),
                                    Color(0xFF047857),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(7),
                              ),
                              child: const Icon(
                                Icons.local_shipping,
                                color: Colors.white,
                                size: 14,
                              ),
                            ),
                            const SizedBox(width: 10),
                            const Text(
                              'VECTOR',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.5,
                                color: Color(0xFF121212),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Smart route optimisation for modern delivery fleets.',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey,
                            height: 1.65,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _footerColumn('Product', [
                    _FooterItem(
                      'Features',
                      onTap: () => scrollToSection(_featuresKey),
                    ),
                    _FooterItem(
                      'How it works',
                      onTap: () => scrollToSection(_howItWorksKey),
                    ),
                    _FooterItem(
                      'Pricing',
                      onTap: () => scrollToSection(_pricingKey),
                    ),
                    _FooterItem('Driver App', path: '/driver'),
                  ]),
                  _footerColumn('Resources', [
                    _FooterItem('Documentation', path: '/docs'),
                    _FooterItem('API Reference', path: '/api'),
                    _FooterItem('Support', path: '/support'),
                    _FooterItem('Contact', path: '/contact'),
                  ]),
                  _footerColumn('Company', [
                    _FooterItem('About Us', path: '/about'),
                    _FooterItem('Careers', path: '/careers'),
                    _FooterItem('Press', path: '/press'),
                    _FooterItem('Security', path: '/security'),
                  ]),
                ],
              ),
              const SizedBox(height: 48),
              const Divider(),
              const SizedBox(height: 24),
              Flex(
                direction: isDesktop ? Axis.horizontal : Axis.vertical,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '© 2026 VECTOR. All rights reserved.',
                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                    textAlign: isDesktop ? TextAlign.left : TextAlign.center,
                  ),
                  if (!isDesktop) const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: isDesktop
                        ? MainAxisAlignment.end
                        : MainAxisAlignment.center,
                    children: [
                      _footerLink('Privacy'),
                      const SizedBox(width: 20),
                      _footerLink('Terms'),
                      const SizedBox(width: 20),
                      _footerLink('Security'),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _footerColumn(String title, List<_FooterItem> items) {
    return SizedBox(
      width: 150,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color.fromARGB(255, 243, 235, 235),
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 20),
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _FooterLink(item: item),
            ),
          ),
        ],
      ),
    );
  }

  Widget _footerLink(String label) {
    return Text(
      label,
      style: const TextStyle(fontSize: 13, color: Colors.grey),
    );
  }

  Widget _sectionHeader(String badge, String title, String subtitle) {
    return Column(
      children: [
        _badge(badge),
        const SizedBox(height: 16),
        Text(
          title,
          style: const TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w800,
            color: Color(0xFF121212),
            letterSpacing: -0.72,
          ),
          textAlign: TextAlign.center,
        ),
        if (subtitle.isNotEmpty) ...[
          const SizedBox(height: 16),
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 540),
              child: Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 17,
                  color: Color(0xFF757575),
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _badge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: Color(0xFF059669),
          letterSpacing: 0.6,
        ),
      ),
    );
  }

  Widget _bullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF059669), size: 16),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF757575),
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
