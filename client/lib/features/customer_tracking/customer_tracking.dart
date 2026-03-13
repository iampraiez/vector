import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';

class CustomerTrackingScreen extends StatefulWidget {
  const CustomerTrackingScreen({super.key});

  @override
  State<CustomerTrackingScreen> createState() => _CustomerTrackingScreenState();
}

class _CustomerTrackingScreenState extends State<CustomerTrackingScreen> {
  final Map<String, dynamic> _mockDelivery = {
    'trackingId': 'VCT-20260306-1234',
    'status': 'out_for_delivery',
    'customerName': 'Sarah Chen',
    'packageCount': 2,
    'estimatedTime': '2:30 PM – 4:00 PM',
    'address': '742 Evergreen Terrace, Springfield, IL',
    'driver': {
      'name': 'Alex Rivera',
      'phone': '+1 (555) 123-4567',
      'rating': 4.9,
      'deliveries': 234,
      'vehicle': 'Ford Transit · ABC-1234',
    },
    'timeline': [
      {'label': 'Order received', 'time': '8:00 AM', 'done': true},
      {'label': 'Route assigned', 'time': '8:45 AM', 'done': true},
      {'label': 'Driver picked up', 'time': '9:30 AM', 'done': true},
      {'label': 'Out for delivery', 'time': '11:15 AM', 'done': true},
      {'label': 'Delivered', 'time': null, 'done': false},
    ],
    'company': 'Acme Logistics',
  };

  int _selectedRating = 0;
  final int _hoverRating = 0;
  final TextEditingController _commentController = TextEditingController();
  final Map<String, bool> _categories = {
    'on_time': false,
    'handled_with_care': false,
    'professional': false,
    'followed_instructions': false,
  };
  bool _submitted = false;

  final Map<String, String> _categoryLabels = {
    'on_time': '⏱ On time',
    'handled_with_care': '📦 Handled with care',
    'professional': '🤝 Professional',
    'followed_instructions': '✅ Followed instructions',
  };

  final Map<String, Map<String, dynamic>> _statusConfig = {
    'pending': {
      'label': 'Pending',
      'color': const Color(0xFFD97706),
      'bg': const Color(0xFFFEF3C7),
      'icon': Icons.schedule,
      'desc': 'Your order is being processed',
    },
    'assigned': {
      'label': 'Assigned',
      'color': const Color(0xFF3B82F6),
      'bg': const Color(0xFFEFF6FF),
      'icon': Icons.local_shipping_outlined,
      'desc': 'A driver has been assigned',
    },
    'out_for_delivery': {
      'label': 'Out for Delivery',
      'color': AppColors.success,
      'bg': const Color(0xFFECFDF5),
      'icon': Icons.local_shipping_outlined,
      'desc': 'Your driver is on the way',
    },
    'delivered': {
      'label': 'Delivered',
      'color': AppColors.success,
      'bg': const Color(0xFFECFDF5),
      'icon': Icons.check_circle_outline,
      'desc': 'Package has been delivered',
    },
    'failed': {
      'label': 'Delivery Failed',
      'color': AppColors.error,
      'bg': const Color(0xFFFEF2F2),
      'icon': Icons.close,
      'desc': 'We couldn\'t complete this delivery',
    },
  };

  @override
  Widget build(BuildContext context) {
    var status = _mockDelivery['status'] as String;
    var sc = _statusConfig[status]!;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Column(
          children: [
            // Top Brand Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: const BoxDecoration(
                color: AppColors.white,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'VECTOR',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.16,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    'Powered by ${_mockDelivery['company']}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Status Card
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0F000000),
                            offset: Offset(0, 2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: sc['bg'],
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(sc['icon'], size: 20, color: sc['color']),
                                const SizedBox(width: 6),
                                Text(
                                  sc['label'],
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: sc['color'],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Hey ${(_mockDelivery['customerName'] as String).split(' ')[0]}! 👋',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            sc['desc'],
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 16),

                          if (status == 'out_for_delivery')
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: const Color(0x26059669),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.schedule,
                                    size: 18,
                                    color: AppColors.primary,
                                  ),
                                  const SizedBox(width: 10),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'ESTIMATED ARRIVAL',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.primary,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      Text(
                                        _mockDelivery['estimatedTime'],
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF5F5F5),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Padding(
                                  padding: EdgeInsets.only(top: 2),
                                  child: Icon(
                                    Icons.location_on_outlined,
                                    size: 16,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'DELIVERING TO',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.textMuted,
                                          letterSpacing: 0.4,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        _mockDelivery['address'],
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Tracking ID: ${_mockDelivery['trackingId']}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textHint,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Timeline
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0F000000),
                            offset: Offset(0, 2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Delivery Progress',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Stack(
                            children: [
                              Positioned(
                                left: 11,
                                top: 14,
                                bottom: 14,
                                width: 2,
                                child: Container(color: AppColors.border),
                              ),
                              Column(
                                children: (_mockDelivery['timeline'] as List)
                                    .asMap()
                                    .entries
                                    .map((e) {
                                      int i = e.key;
                                      var step = e.value;
                                      bool done = step['done'];
                                      return Padding(
                                        padding: EdgeInsets.only(
                                          bottom:
                                              i <
                                                  (_mockDelivery['timeline']
                                                              as List)
                                                          .length -
                                                      1
                                              ? 16
                                              : 0,
                                        ),
                                        child: Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Container(
                                              width: 24,
                                              height: 24,
                                              decoration: BoxDecoration(
                                                color: done
                                                    ? AppColors.primary
                                                    : AppColors.white,
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                  color: done
                                                      ? AppColors.primary
                                                      : const Color(0x26000000),
                                                  width: 2,
                                                ),
                                              ),
                                              alignment: Alignment.center,
                                              child: done
                                                  ? const Icon(
                                                      Icons.check,
                                                      size: 12,
                                                      color: AppColors.white,
                                                    )
                                                  : null,
                                            ),
                                            const SizedBox(width: 14),
                                            Expanded(
                                              child: Padding(
                                                padding: const EdgeInsets.only(
                                                  top: 2,
                                                ),
                                                child: Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    Text(
                                                      step['label'],
                                                      style: TextStyle(
                                                        fontSize: 13,
                                                        fontWeight: done
                                                            ? FontWeight.w600
                                                            : FontWeight.w400,
                                                        color: done
                                                            ? AppColors
                                                                  .textPrimary
                                                            : AppColors
                                                                  .textMuted,
                                                      ),
                                                    ),
                                                    if (step['time'] != null)
                                                      Text(
                                                        step['time'],
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          color: AppColors
                                                              .textMuted,
                                                        ),
                                                      ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    })
                                    .toList(),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Driver Info
                    if (status == 'out_for_delivery' || status == 'delivered')
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x0F000000),
                              offset: Offset(0, 2),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Your Driver',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                Container(
                                  width: 52,
                                  height: 52,
                                  decoration: const BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    (_mockDelivery['driver']['name'] as String)
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join(''),
                                    style: const TextStyle(
                                      color: AppColors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _mockDelivery['driver']['name'],
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Row(
                                        children: [
                                          const Icon(
                                            Icons.star,
                                            size: 13,
                                            color: Color(0xFFFBBF24),
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            '${_mockDelivery['driver']['rating']} · ${_mockDelivery['driver']['deliveries']} deliveries',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        _mockDelivery['driver']['vehicle'],
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (status == 'out_for_delivery')
                                  InkWell(
                                    onTap: () {},
                                    child: Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFECFDF5),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: const Color(0x33059669),
                                        ),
                                      ),
                                      alignment: Alignment.center,
                                      child: const Icon(
                                        Icons.phone,
                                        size: 18,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),

                    // Rating Section
                    if (status == 'delivered' && !_submitted)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x0F000000),
                              offset: Offset(0, 2),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            const Text(
                              'How was your delivery?',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Help ${(_mockDelivery['driver']['name'] as String).split(' ')[0]} improve with your feedback',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 18),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [1, 2, 3, 4, 5].map((star) {
                                bool active =
                                    _hoverRating >= star ||
                                    _selectedRating >= star;
                                return GestureDetector(
                                  onTap: () =>
                                      setState(() => _selectedRating = star),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 4,
                                    ),
                                    child: Icon(
                                      active ? Icons.star : Icons.star_border,
                                      size: 36,
                                      color: active
                                          ? const Color(0xFFFBBF24)
                                          : AppColors.textHint,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 16),

                            if (_selectedRating > 0) ...[
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                alignment: WrapAlignment.center,
                                children: _categories.keys.map((key) {
                                  bool active = _categories[key]!;
                                  return InkWell(
                                    onTap: () => setState(
                                      () => _categories[key] = !active,
                                    ),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 14,
                                        vertical: 7,
                                      ),
                                      decoration: BoxDecoration(
                                        color: active
                                            ? const Color(0xFFECFDF5)
                                            : AppColors.white,
                                        borderRadius: BorderRadius.circular(99),
                                        border: Border.all(
                                          color: active
                                              ? AppColors.primary
                                              : const Color(0x1F000000),
                                        ),
                                      ),
                                      child: Text(
                                        _categoryLabels[key]!,
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w500,
                                          color: active
                                              ? AppColors.primary
                                              : AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 14),
                              TextField(
                                controller: _commentController,
                                minLines: 3,
                                maxLines: 5,
                                decoration: InputDecoration(
                                  hintText: 'Add a note (optional)...',
                                  filled: true,
                                  fillColor: AppColors.white,
                                  contentPadding: const EdgeInsets.all(12),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                      color: AppColors.border,
                                    ),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                      color: AppColors.border,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                      color: AppColors.primary,
                                      width: 2,
                                    ),
                                  ),
                                ),
                              ),
                            ],

                            const SizedBox(height: 14),
                            SizedBox(
                              width: double.infinity,
                              height: 48,
                              child: ElevatedButton(
                                onPressed: _selectedRating > 0
                                    ? () => setState(() => _submitted = true)
                                    : null,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  disabledBackgroundColor: const Color(
                                    0xFFE0E0E0,
                                  ),
                                  disabledForegroundColor: AppColors.textMuted,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text(
                                  'Submit Rating',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Rating Success
                    if (_submitted)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 28,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0x33059669)),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x1A059669),
                              offset: Offset(0, 2),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0x33059669),
                                  width: 2,
                                ),
                              ),
                              alignment: Alignment.center,
                              child: const Icon(
                                Icons.check_circle,
                                size: 30,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(height: 14),
                            const Text(
                              'Thanks for the feedback!',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Your rating helps us improve the delivery experience. See you next time!',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),

                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Center(
                        child: Text(
                          'Powered by VECTOR · Learn more',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textHint,
                          ),
                        ), // Normally rich text
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
