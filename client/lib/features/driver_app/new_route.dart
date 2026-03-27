import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:csv/csv.dart';
import 'package:intl/intl.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/inputs.dart';
import '../../shared/widgets/buttons.dart';
import '../../core/services/driver_api_service.dart';
import '../../core/services/location_service.dart';

class NewRouteScreen extends StatefulWidget {
  final bool isManualTab;
  const NewRouteScreen({super.key, this.isManualTab = true});

  @override
  State<NewRouteScreen> createState() => _NewRouteScreenState();
}

class _NewRouteScreenState extends State<NewRouteScreen> {
  late bool _isManualTab;
  final TextEditingController _nameController = TextEditingController();
  final List<Map<String, dynamic>> _stops = [
    {
      'id': UniqueKey().toString(),
      'customerName': '', 
      'customerEmail': '',
      'customerPhone': '',
      'address': '', 
      'packages': 1, 
      'notes': '',
      'externalId': '',
      'priority': 'normal',
      'date': DateTime.now(),
      'timeWindowStart': '09:00',
      'timeWindowEnd': '17:00'
    }
  ];
  bool _creating = false;
  bool _autoOptimize = false;
  String? _importedFileName;

  Future<void> _pickAndParseCSV() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['csv'],
        withData: true,
      );
      if (result != null) {
        final file = result.files.single;
        final csvString = file.bytes != null 
            ? utf8.decode(file.bytes!) 
            : await File(file.path!).readAsString();
            
        List<List<dynamic>> rowsAsListOfValues = const CsvDecoder().convert(csvString);
        if (rowsAsListOfValues.isEmpty) return;
        
        final headers = rowsAsListOfValues[0].map((h) => h.toString().toLowerCase().trim()).toList();
        
        int addressIdx = headers.indexWhere((h) => h.contains('address'));
        int nameIdx = headers.indexWhere((h) => h.contains('name') && !h.contains('company'));
        int emailIdx = headers.indexWhere((h) => h.contains('email'));
        int phoneIdx = headers.indexWhere((h) => h.contains('phone') || h.contains('mobile'));
        int pkgsIdx = headers.indexWhere((h) => h.contains('package') || h.contains('qty') || h.contains('quantity'));
        int notesIdx = headers.indexWhere((h) => h.contains('note'));
        int orderIdx = headers.indexWhere((h) => h.contains('order') || h.contains('external'));
        int priorityIdx = headers.indexWhere((h) => h.contains('priority'));
        
        if (addressIdx == -1) {
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('CSV must contain an "Address" column')));
          return;
        }

        setState(() {
          _importedFileName = file.name;
          // Keep the name field empty so user can enter a proper route name
          if (_nameController.text.isEmpty) {
            _nameController.text = '';
          }
          _stops.clear();
          
          for (int i = 1; i < rowsAsListOfValues.length; i++) {
            final row = rowsAsListOfValues[i];
            if (row.length <= addressIdx) continue;
            final address = row[addressIdx].toString().trim();
            if (address.isEmpty) continue;
            
            _stops.add({
              'id': UniqueKey().toString(),
              'customerName': nameIdx != -1 && row.length > nameIdx ? row[nameIdx].toString().trim() : '',
              'customerEmail': emailIdx != -1 && row.length > emailIdx ? row[emailIdx].toString().trim() : '',
              'customerPhone': phoneIdx != -1 && row.length > phoneIdx ? row[phoneIdx].toString().trim() : '',
              'address': address,
              'packages': pkgsIdx != -1 && row.length > pkgsIdx ? (int.tryParse(row[pkgsIdx].toString()) ?? 1) : 1,
              'notes': notesIdx != -1 && row.length > notesIdx ? row[notesIdx].toString().trim() : '',
              'externalId': orderIdx != -1 && row.length > orderIdx ? row[orderIdx].toString().trim() : '',
              'priority': priorityIdx != -1 && row.length > priorityIdx ? _parsePriority(row[priorityIdx].toString()) : 'normal',
              'date': DateTime.now(),
              'timeWindowStart': '09:00',
              'timeWindowEnd': '17:00'
            });
          }
        });
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to read CSV: $e')));
    }
  }

  String _parsePriority(String p) {
    final lower = p.toLowerCase().trim();
    if (['low', 'normal', 'high', 'urgent'].contains(lower)) return lower;
    return 'normal';
  }

  @override
  void initState() {
    super.initState();
    _isManualTab = widget.isManualTab;
  }

  void _addStop() {
    setState(() => _stops.add({
      'id': UniqueKey().toString(),
      'customerName': '', 
      'customerEmail': '',
      'customerPhone': '',
      'address': '', 
      'packages': 1, 
      'notes': '',
      'externalId': '',
      'priority': 'normal',
      'date': DateTime.now(),
      'timeWindowStart': '09:00',
      'timeWindowEnd': '17:00'
    }));
  }

  void _removeStop(int index) {
    if (_stops.length > 1) {
      setState(() => _stops.removeAt(index));
    }
  }

  Future<void> _createRoute() async {
    if (_nameController.text.trim().isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please enter a name for this route'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    final validStops = _stops.where((s) => (s['address'] as String).trim().isNotEmpty).toList();
    if (validStops.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('At least one stop must have a valid address'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }
    
    setState(() => _creating = true);
    try {
      final route = await DriverApiService.instance.createRoute(
        name: _nameController.text,
        stops: validStops.map((s) => {
          'customerName': s['customerName'],
          'customerEmail': s['customerEmail'],
          'customerPhone': s['customerPhone'],
          'address': s['address'],
          'packages': s['packages'],
          'notes': s['notes'],
          'externalId': s['externalId'],
          'priority': s['priority'],
          'delivery_date': (s['date'] as DateTime).toIso8601String(),
          'time_window_start': s['timeWindowStart'],
          'time_window_end': s['timeWindowEnd'],
        }).toList(),
      );

      if (_autoOptimize) {
        final rawStops = route['stops'];
        if (rawStops is List && rawStops.isNotEmpty) {
          final ids = rawStops
              .map((s) => s is Map<String, dynamic> ? s['id'] as String? : null)
              .whereType<String>()
              .toList();
          if (ids.length == rawStops.length) {
            try {
              final pos = await LocationService.instance.getCurrentPosition();
              await DriverApiService.instance.optimizeAssignments(
                stopIds: ids,
                lat: pos?.latitude ?? 6.5244,
                lng: pos?.longitude ?? 3.3792,
                persist: true,
              );
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Route created, but optimization failed: $e'),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
            }
          }
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Orders successfully added to the system!'),
            backgroundColor: AppColors.success,
            duration: Duration(seconds: 3),
          ),
        );
        context.push('/route-preview', extra: route);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create route: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    bool canCreate = _nameController.text.isNotEmpty && _stops.any((s) => s['address'].isNotEmpty);

    return Scaffold(
      backgroundColor: AppColors.white,
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

                      _buildStopsList(),
                    
                    const SizedBox(height: AppSpacing.p4),

                    // Simplified Auto-optimize Toggle
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p4, vertical: AppSpacing.p2),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
                          const SizedBox(width: AppSpacing.p3),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('Auto-optimize route', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                                Text('AI organizes stops efficiently', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                          Switch.adaptive(
                            value: _autoOptimize,
                            activeTrackColor: AppColors.primary,
                            onChanged: (v) => setState(() => _autoOptimize = v),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.p6),
                    // Fleet manager note
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p4, vertical: AppSpacing.p3),
                      decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFFEF3C7))),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Icon(Icons.warning_amber_rounded, size: 18, color: Color(0xFFD97706)),
                          SizedBox(width: 8),
                          Expanded(child: Text('Note: Once added, these orders are synced to the database. Only your Fleet Manager can delete them.', style: TextStyle(fontSize: 12, color: Color(0xFF92400E), height: 1.4))),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.p4),
                    AppButton(
                      label: _creating ? 'Creating...' : 'Create route',
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
                              onPressed: _pickAndParseCSV,
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
                                      Text('${_stops.length} orders detected', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 12)),
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
                          
                          // Preview List for Import
                          const Text('REVIEW IMPORTED STOPS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.7)),
                          const SizedBox(height: AppSpacing.p2),
                          _buildStopsList(),

                          const SizedBox(height: AppSpacing.p6),
                          // Fleet manager note
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p4, vertical: AppSpacing.p3),
                            decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFFEF3C7))),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Icon(Icons.warning_amber_rounded, size: 18, color: Color(0xFFD97706)),
                                SizedBox(width: 8),
                                Expanded(child: Text('Note: Once added, these orders are synced to the database. Only your Fleet Manager can delete them.', style: TextStyle(fontSize: 12, color: Color(0xFF92400E), height: 1.4))),
                              ],
                            ),
                          ),
                          const SizedBox(height: AppSpacing.p4),
                          AppButton(
                            label: 'Confirm & import orders',
                            isLoading: _creating,
                            isFullWidth: true,
                            onPressed: canCreate ? _createRoute : () {},
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
                            'Upload a CSV with these columns:\n• Full Address (Required)\n• Customer Name, Email, Phone (Optional)\n• Packages (Default: 1)\n• Order #, Priority, Notes (Optional)',
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

  Widget _buildStopsList() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('STOPS (${_stops.length})', 
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.7)),
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
            key: ValueKey(s['id']),
            margin: const EdgeInsets.only(bottom: AppSpacing.p3),
            padding: const EdgeInsets.all(AppSpacing.p4),
            decoration: BoxDecoration(
              color: AppColors.white, 
              borderRadius: BorderRadius.circular(16), 
              border: Border.all(color: AppColors.border),
            ),
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
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        hintText: 'Email',
                        initialValue: s['customerEmail'],
                        onChanged: (v) => setState(() => _stops[idx]['customerEmail'] = v),
                        prefixIcon: const Icon(Icons.email_outlined, size: 18),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.p3),
                    Expanded(
                      child: AppTextField(
                        hintText: 'Phone',
                        initialValue: s['customerPhone'],
                        onChanged: (v) => setState(() => _stops[idx]['customerPhone'] = v),
                        prefixIcon: const Icon(Icons.phone_outlined, size: 18),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.p3),
                AppTextField(
                  hintText: 'Enter delivery address',
                  initialValue: s['address'],
                  onChanged: (v) => setState(() => _stops[idx]['address'] = v),
                  prefixIcon: const Icon(Icons.location_on_outlined, size: 18),
                ),
                const SizedBox(height: AppSpacing.p3),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        hintText: 'Order # (Optional)',
                        initialValue: s['externalId'],
                        onChanged: (v) => setState(() => _stops[idx]['externalId'] = v),
                        prefixIcon: const Icon(Icons.tag, size: 18),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.p3),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF9FAFB),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: s['priority'],
                            isExpanded: true,
                            icon: const Icon(Icons.keyboard_arrow_down, size: 18),
                            style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w500),
                            onChanged: (v) => setState(() => _stops[idx]['priority'] = v),
                            items: ['low', 'normal', 'high', 'urgent'].map((p) {
                              return DropdownMenuItem(
                                value: p,
                                child: Text(p[0].toUpperCase() + p.substring(1)),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.p3),
                AppTextField(
                  hintText: 'Add notes for this stop...',
                  initialValue: s['notes'],
                  onChanged: (v) => setState(() => _stops[idx]['notes'] = v),
                  prefixIcon: const Icon(Icons.notes, size: 18),
                  maxLines: 2,
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
                // Per-stop Date and Time Range
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
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.p2),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 16, color: AppColors.primary),
                        const SizedBox(width: 12),
                        const Expanded(
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
                ),
                const SizedBox(height: AppSpacing.p2),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 16, color: AppColors.primary),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Time Window',
                        style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                      ),
                    ),
                    Row(
                      children: [
                        InkWell(
                          onTap: () async {
                            final TimeOfDay? time = await showTimePicker(
                              context: context,
                              initialTime: TimeOfDay(
                                hour: int.parse(s['timeWindowStart'].split(':')[0]),
                                minute: int.parse(s['timeWindowStart'].split(':')[1]),
                              ),
                            );
                            if (time != null) {
                              setState(() => _stops[idx]['timeWindowStart'] = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}');
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.border)),
                            child: Text(s['timeWindowStart'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          ),
                        ),
                        const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('to', style: TextStyle(fontSize: 12, color: AppColors.textHint))),
                        InkWell(
                          onTap: () async {
                            final TimeOfDay? time = await showTimePicker(
                              context: context,
                              initialTime: TimeOfDay(
                                hour: int.parse(s['timeWindowEnd'].split(':')[0]),
                                minute: int.parse(s['timeWindowEnd'].split(':')[1]),
                              ),
                            );
                            if (time != null) {
                              setState(() => _stops[idx]['timeWindowEnd'] = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}');
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.border)),
                            child: Text(s['timeWindowEnd'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}
