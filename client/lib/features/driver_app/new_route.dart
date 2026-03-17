import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/inputs.dart';
import '../../shared/widgets/buttons.dart';

class NewRouteScreen extends StatefulWidget {
  const NewRouteScreen({super.key});

  @override
  State<NewRouteScreen> createState() => _NewRouteScreenState();
}

class _NewRouteScreenState extends State<NewRouteScreen> {
  bool _isManualTab = true;
  final TextEditingController _nameController = TextEditingController();
  final List<Map<String, dynamic>> _stops = [
    {'customerName': '', 'address': '', 'packages': 1, 'date': DateTime.now()}
  ];
  bool _creating = false;
  String? _importedFileName;
  int _detectedOrders = 0;

  void _addStop() {
    setState(() => _stops.add({'customerName': '', 'address': '', 'packages': 1, 'date': DateTime.now()}));
  }

  void _removeStop(int index) {
    if (_stops.length > 1) {
      setState(() => _stops.removeAt(index));
    }
  }

  void _createRoute() {
    setState(() => _creating = true);
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) context.push('/route-preview');
    });
  }

  @override
  Widget build(BuildContext context) {
    bool canCreate = _nameController.text.isNotEmpty && _stops.any((s) => s['address'].isNotEmpty);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: Column(
          children: [
            // Unified Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              decoration: BoxDecoration(
                color: AppColors.white,
                border: const Border(bottom: BorderSide(color: AppColors.border)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    offset: const Offset(0, 4),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 16),
                  const Text(
                    'Create route',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.6,
                    ),
                  ),
                ],
              ),
            ),
            
            Expanded(
              child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.p4),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Add stops manually or import from a file', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                  const SizedBox(height: AppSpacing.p4),

                  // Tab switcher
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F0F0),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isManualTab = true),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: _isManualTab ? AppColors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: _isManualTab ? const [BoxShadow(color: Color(0x0F000000), offset: Offset(0, 2), blurRadius: 4)] : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.location_on_outlined, size: 18, color: _isManualTab ? AppColors.primary : AppColors.textSecondary),
                                  const SizedBox(width: 8),
                                  Text('Manual Entry', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _isManualTab ? AppColors.primary : AppColors.textSecondary)),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isManualTab = false),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: !_isManualTab ? AppColors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: !_isManualTab ? const [BoxShadow(color: Color(0x0F000000), offset: Offset(0, 2), blurRadius: 4)] : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.upload_file, size: 18, color: !_isManualTab ? AppColors.primary : AppColors.textSecondary),
                                  const SizedBox(width: 8),
                                  Text('Import File', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: !_isManualTab ? AppColors.primary : AppColors.textSecondary)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.p6),

                  if (_isManualTab) ...[
                    // Route Name
                    const Text('ROUTE NAME', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.7)),
                    const SizedBox(height: AppSpacing.p2),
                    AppTextField(controller: _nameController, hintText: 'e.g., Downtown Deliveries', onChanged: (_) => setState(() {})),
                    
                    const SizedBox(height: AppSpacing.p6),

                    // Stops
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('STOPS (${_stops.length})', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.7)),
                        TextButton.icon(
                          onPressed: _addStop,
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Add stop', style: TextStyle(fontWeight: FontWeight.w600)),
                          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                        )
                      ],
                    ),
                    const SizedBox(height: AppSpacing.p2),

                    ..._stops.asMap().entries.map((e) {
                      int idx = e.key;
                      var s = e.value;
                      return Container(
                        margin: const EdgeInsets.only(bottom: AppSpacing.p3),
                        padding: const EdgeInsets.all(AppSpacing.p4),
                        decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle),
                                  alignment: Alignment.center,
                                  child: Text('${idx + 1}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                ),
                                const SizedBox(width: AppSpacing.p3),
                                Expanded(child: Text('STOP ${idx + 1}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5))),
                                if (_stops.length > 1)
                                  IconButton(
                                    icon: const Icon(Icons.close, size: 18),
                                    color: AppColors.textHint,
                                    onPressed: () => _removeStop(idx),
                                  )
                              ],
                            ),
                            const SizedBox(height: AppSpacing.p3),
                            AppTextField(
                              hintText: 'Customer name (Optional)',
                              initialValue: s['customerName'],
                              onChanged: (v) => setState(() => _stops[idx]['customerName'] = v),
                              prefixIcon: const Icon(Icons.person_outline, size: 18),
                            ),
                            const SizedBox(height: AppSpacing.p3),
                            AppTextField(
                              hintText: 'Enter delivery address',
                              initialValue: s['address'],
                              onChanged: (v) => setState(() => _stops[idx]['address'] = v),
                              prefixIcon: const Icon(Icons.location_on_outlined, size: 18),
                            ),
                            const SizedBox(height: AppSpacing.p2),
                            Row(
                              children: [
                                const Icon(Icons.inventory_2_outlined, size: 16, color: AppColors.textSecondary),
                                const SizedBox(width: AppSpacing.p2),
                                const Expanded(child: Text('Packages', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textSecondary))),
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline),
                                  color: s['packages'] > 1 ? AppColors.textSecondary : AppColors.border,
                                  onPressed: s['packages'] > 1 ? () => setState(() => _stops[idx]['packages']--) : null,
                                ),
                                Container(
                                  width: 40,
                                  alignment: Alignment.center,
                                  child: Text('${s['packages']}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline),
                                  color: AppColors.primary,
                                  onPressed: () => setState(() => _stops[idx]['packages']++),
                                ),
                              ],
                            ),
                            const Divider(color: AppColors.border, height: 24),
                            // Per-stop Date
                            InkWell(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: s['date'],
                                  firstDate: DateTime.now(),
                                  lastDate: DateTime.now().add(const Duration(days: 365)),
                                );
                                if (picked != null) setState(() => _stops[idx]['date'] = picked);
                              },
                              child: Row(
                                children: [
                                  const Icon(Icons.calendar_today_outlined, size: 16, color: AppColors.primary),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'Delivery Date',
                                      style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                                    ),
                                  ),
                                  Text(
                                    DateFormat('MMM dd, yyyy').format(s['date']),
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(Icons.chevron_right, size: 16, color: AppColors.textHint),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                    
                    const SizedBox(height: AppSpacing.p4),

                    // Optimize toggle
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.p4),
                      decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(16)),
                      child: Row(
                        children: [
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                            child: const Icon(Icons.autorenew, color: AppColors.white, size: 18),
                          ),
                          const SizedBox(width: AppSpacing.p3),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('Auto-optimize route', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                Text('AI will calculate the best order', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w500)),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.p6),
                    AppButton(
                      label: _creating ? 'Creating...' : 'Create & optimize route',
                      isFullWidth: true,
                      onPressed: canCreate ? _createRoute : () {},
                    ),
                  ] else ...[
                    // Import UI
                    if (_importedFileName == null)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border, width: 1.5), // Clean solid border
                        ),
                        alignment: Alignment.center,
                        child: Column(
                          children: [
                            Container(
                              width: 64, height: 64,
                              decoration: BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle),
                              child: const Icon(Icons.upload_file, color: AppColors.primary, size: 28),
                            ),
                            const SizedBox(height: AppSpacing.p4),
                            const Text('Upload CSV or Excel file', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                            const SizedBox(height: AppSpacing.p2),
                            const Text('Drag and drop or click to browse', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                            const SizedBox(height: AppSpacing.p4),
                            AppButton(
                              label: 'Choose file', 
                              variant: ButtonVariant.outline, 
                              onPressed: () {
                                setState(() {
                                  _importedFileName = 'orders_march_17.csv';
                                  _detectedOrders = 12;
                                });
                              }
                            )
                          ],
                        ),
                      )
                    else
                      Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(AppSpacing.p4),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.primary),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 40, height: 40,
                                  decoration: BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle),
                                  child: const Icon(Icons.description, color: AppColors.primary, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(_importedFileName!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                                      Text('$_detectedOrders orders detected', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                                  onPressed: () => setState(() => _importedFileName = null),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: AppSpacing.p6),
                          AppButton(
                            label: _creating ? 'Importing...' : 'Confirm & import orders',
                            isFullWidth: true,
                            onPressed: _createRoute,
                          ),
                        ],
                      ),
                    
                    const SizedBox(height: AppSpacing.p6),
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.p5),
                      decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.info_outline, color: AppColors.primary, size: 20),
                              SizedBox(width: AppSpacing.p3),
                              Text('Simple Import Guide', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.p3),
                          const Text(
                            'Upload a CSV with these columns:\n• Full Address (Required)\n• Packages (Default: 1)\n• Customer Name (Optional)',
                            style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                          )
                        ],
                      ),
                    )
                  ]
                ],
              ),
            ),
          ),
        ),
      ),
          ],
        ),
      ),
    );
  }
}
