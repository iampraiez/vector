import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class WebLandingScreen extends StatefulWidget {
  const WebLandingScreen({super.key});

  @override
  State<WebLandingScreen> createState() => _WebLandingScreenState();
}

class _WebLandingScreenState extends State<WebLandingScreen> {
  final ScrollController _scrollController = ScrollController();
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
      preferredSize: Size.fromHeight(64),
      child: AppBar(
        backgroundColor: Colors.white.withValues(alpha: _scrolled ? 0.95 : 0.0),
        elevation: 0,
        title: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1200),
            child: Row(
              children: [
                InkWell(
                  onTap: () => context.go('/'),
                  child: Text(
                    'VECTOR',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                if (isDesktop) ...[
                  const Spacer(),
                  _navLink('Features'),
                  const SizedBox(width: 20),
                  _navLink('Pricing'),
                  const SizedBox(width: 20),
                  _navLink('Dashboard', path: '/dashboard'),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navLink(String label, {String? path}) {
    return InkWell(
      onTap: () {
        if (path != null) {
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
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            _mobileNavItem(context, 'Features'),
            _mobileNavItem(context, 'How it works'),
            _mobileNavItem(context, 'Pricing'),
            const Divider(indent: 24, endIndent: 24, height: 40),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go('/dashboard/signin'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.all(14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
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
                        padding: const EdgeInsets.all(14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      child: const Text('Get started free'),
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

  Widget _mobileNavItem(BuildContext context, String label) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24),
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Color(0xFF212121),
        ),
      ),
      onTap: () => Navigator.pop(context),
    );
  }

  Widget _buildHero(BuildContext context, bool isDesktop) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, isDesktop ? 160 : 120, 24, 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
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
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        border: Border.all(color: const Color(0x33059669)),
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF059669),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'NOW IN OPEN BETA — FREE FOR FLEETS UNDER 5 DRIVERS',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF059669),
                              letterSpacing: 0.22,
                            ),
                          ),
                        ],
                      ),
                    ),
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
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        ElevatedButton.icon(
                          onPressed: () => context.go('/dashboard/signup'),
                          icon: const Text(
                            'Start free trial',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          label: const Icon(Icons.arrow_forward, size: 16),
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
                        OutlinedButton.icon(
                          onPressed: () => context.go('/driver'),
                          icon: const Icon(Icons.local_shipping, size: 16),
                          label: const Text('Driver app'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF212121),
                            side: BorderSide(
                              color: Colors.black.withValues(alpha: 0.12),
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
                ),
              ),
              // Right Visual
              SizedBox(
                width: isDesktop ? 550 : double.infinity,
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
                ),
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
          constraints: const BoxConstraints(maxWidth: 1000),
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
    );
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
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              _sectionHeader(
                'Features',
                'Everything your fleet needs',
                'From route planning to proof of delivery, VECTOR handles the full delivery lifecycle so you can focus on growth.',
              ),
              const SizedBox(height: 64),
              GridView.count(
                crossAxisCount: isDesktop
                    ? 3
                    : (MediaQuery.of(context).size.width > 600 ? 2 : 1),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 24,
                crossAxisSpacing: 24,
                childAspectRatio: 1.3,
                children: [
                  _featureCard(
                    Icons.bolt,
                    'AI Route Optimization',
                    'Our engine calculates the fastest routes across hundreds of stops in seconds, saving up to 40% in drive time.',
                  ),
                  _featureCard(
                    Icons.location_on,
                    'Live GPS Tracking',
                    'Track every driver on a live map. See ETAs, position, and delivery status updated in real time.',
                  ),
                  _featureCard(
                    Icons.assignment_turned_in,
                    'Proof of Delivery',
                    'Drivers capture photos and signatures at each stop. Every delivery is verified and timestamped.',
                  ),
                  _featureCard(
                    Icons.notifications_active,
                    'Customer Notifications',
                    'Automatically send customers a tracking link so they know exactly when to expect their delivery.',
                  ),
                  _featureCard(
                    Icons.bar_chart,
                    'Fleet Analytics',
                    'Deep reports on performance, fuel cost, on-time rates, and driver efficiency — all in one dashboard.',
                  ),
                  _featureCard(
                    Icons.people,
                    'Simple Driver Onboarding',
                    'Drivers join using your unique company code. No admin overhead. They\'re ready to go in under 2 minutes.',
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
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.08)),
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
          const SizedBox(height: 8),
          Text(
            desc,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF757575),
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHowItWorks(BuildContext context, bool isDesktop) {
    return Container(
      color: const Color(0xFFF8FAF9),
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
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
                  ),
                  _stepCard(
                    '02',
                    'Add drivers instantly',
                    'Share your company code with drivers. They download the app, enter the code, and they\'re on your fleet.',
                  ),
                  _stepCard(
                    '03',
                    'Build & assign routes',
                    'Create a route, add stops, optimise with one click, then assign it to any driver from the dashboard.',
                  ),
                  _stepCard(
                    '04',
                    'Track, verify & improve',
                    'Monitor deliveries live, receive proof-of-delivery photos, and use analytics to sharpen your operations.',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _stepCard(String number, String title, String desc) {
    return Container(
      width: 250,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.07)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            number,
            style: const TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w900,
              color: Color(0x1F059669),
              letterSpacing: -1.08,
              height: 1,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF121212),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            desc,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF757575),
              height: 1.65,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardPreview(BuildContext context, bool isDesktop) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
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
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.15),
                  ),
                  borderRadius: BorderRadius.circular(99),
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
              Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  ElevatedButton.icon(
                    onPressed: () => context.go('/driver'),
                    icon: const Text(
                      'Open driver app',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    label: const Icon(Icons.open_in_new, size: 16),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF34D399),
                      foregroundColor: const Color(0xFF064E3B),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 28,
                        vertical: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () => context.go('/driver'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white24),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 28,
                        vertical: 12,
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
          constraints: const BoxConstraints(maxWidth: 1100),
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
          constraints: const BoxConstraints(maxWidth: 1100),
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
                    '29',
                    '/mo',
                    'Up to 5 drivers',
                    [
                      'Route optimization',
                      'Live GPS tracking',
                      'Proof of delivery',
                      'Customer tracking links',
                      'Email support',
                    ],
                    'Start free trial',
                    false,
                  ),
                  _pricingCard(
                    'Growth',
                    '89',
                    '/mo',
                    'Up to 20 drivers',
                    [
                      'Everything in Starter',
                      'Advanced analytics',
                      'Priority routing',
                      'SMS notifications',
                      'Priority support',
                      'API access',
                    ],
                    'Start free trial',
                    true,
                  ),
                  _pricingCard(
                    'Enterprise',
                    'Custom',
                    '',
                    'Unlimited drivers',
                    [
                      'Everything in Growth',
                      'Dedicated manager',
                      'Custom integrations',
                      'SLA guarantee',
                      'On-site onboarding',
                      'White-label option',
                    ],
                    'Contact sales',
                    false,
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
  ) {
    return Container(
      width: 320,
      padding: const EdgeInsets.all(32),
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
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  alignment: WrapAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => context.go('/dashboard/signup'),
                      icon: const Text(
                        'Start free trial',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      label: const Icon(Icons.arrow_forward, size: 16),
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
                      ),
                    ),
                    OutlinedButton(
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
                        textStyle: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      child: const Text('Sign in to dashboard'),
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
          constraints: const BoxConstraints(maxWidth: 1200),
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
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
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
                    'Features',
                    'Pricing',
                    'How it works',
                    'Changelog',
                  ]),
                  _footerColumn('Drivers', [
                    'Driver app',
                    'Driver sign in',
                    'Driver sign up',
                    'Track a delivery',
                  ]),
                  _footerColumn('Fleet owners', [
                    'Dashboard',
                    'Sign in',
                    'Get started',
                    'Contact sales',
                  ]),
                ],
              ),
              const SizedBox(height: 48),
              const Divider(),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '© 2026 VECTOR. All rights reserved.',
                    style: TextStyle(fontSize: 13, color: Colors.grey),
                  ),
                  Row(
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

  Widget _footerColumn(String title, List<String> items) {
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
              color: Colors.grey,
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 16),
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Text(
                item,
                style: const TextStyle(fontSize: 14, color: Color(0xFF757575)),
              ),
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
