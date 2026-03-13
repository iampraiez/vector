import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
    {'address': '', 'packages': 1}
  ];
  bool _creating = false;

  void _addStop() {
    setState(() => _stops.add({'address': '', 'packages': 1}));
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
      backgroundColor: Theme.of(context).scaffoldBackgroundColor, // Maps to PageBackground
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text('Create route', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontWeight: FontWeight.w700)),
        centerTitle: false,
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: Theme.of(context).colorScheme.outline, height: 1),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.p4),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Add stops manually or import from a file', style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                  const SizedBox(height: AppSpacing.p4),

                  // Tab switcher
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceContainerHighest,
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
                                color: _isManualTab ? Theme.of(context).colorScheme.surface : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: _isManualTab ? const [BoxShadow(color: Color(0x0F000000), offset: Offset(0, 2), blurRadius: 4)] : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.location_on_outlined, size: 18, color: _isManualTab ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant),
                                  const SizedBox(width: 8),
                                  Text('Manual Entry', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _isManualTab ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant)),
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
                                color: !_isManualTab ? Theme.of(context).colorScheme.surface : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: !_isManualTab ? const [BoxShadow(color: Color(0x0F000000), offset: Offset(0, 2), blurRadius: 4)] : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.upload_file, size: 18, color: !_isManualTab ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant),
                                  const SizedBox(width: 8),
                                  Text('Import File', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: !_isManualTab ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant)),
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
                    Text('ROUTE NAME', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurfaceVariant, letterSpacing: 0.5)),
                    const SizedBox(height: AppSpacing.p2),
                    AppTextField(controller: _nameController, hintText: 'e.g., Downtown Deliveries', onChanged: (_) => setState(() {})),
                    
                    const SizedBox(height: AppSpacing.p6),

                    // Stops
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('STOPS (${_stops.length})', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurfaceVariant, letterSpacing: 0.5)),
                        TextButton.icon(
                          onPressed: _addStop,
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Add stop'),
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
                        decoration: BoxDecoration(color: Theme.of(context).colorScheme.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: Theme.of(context).colorScheme.outline)),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, shape: BoxShape.circle),
                                  alignment: Alignment.center,
                                  child: Text('${idx + 1}', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onPrimary)),
                                ),
                                const SizedBox(width: AppSpacing.p3),
                                Expanded(child: Text('STOP ${idx + 1}', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurfaceVariant, letterSpacing: 0.5))),
                                if (_stops.length > 1)
                                  IconButton(
                                    icon: Icon(Icons.close, size: 16),
                                    color: Theme.of(context).colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                                    onPressed: () => _removeStop(idx),
                                  )
                              ],
                            ),
                            const SizedBox(height: AppSpacing.p3),
                            AppTextField(
                              hintText: 'Enter delivery address',
                              initialValue: s['address'],
                              onChanged: (v) => setState(() => _stops[idx]['address'] = v),
                            ),
                            const SizedBox(height: AppSpacing.p2),
                            Row(
                              children: [
                                Icon(Icons.inventory_2_outlined, size: 16, color: Theme.of(context).colorScheme.onSurfaceVariant),
                                SizedBox(width: AppSpacing.p2),
                                Expanded(child: Text('Packages', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Theme.of(context).colorScheme.onSurfaceVariant))),
                                IconButton(
                                  icon: Icon(Icons.remove_circle_outline),
                                  color: s['packages'] > 1 ? Theme.of(context).colorScheme.onSurfaceVariant : Theme.of(context).colorScheme.outline,
                                  onPressed: s['packages'] > 1 ? () => setState(() => _stops[idx]['packages']--) : null,
                                ),
                                Container(
                                  width: 40,
                                  alignment: Alignment.center,
                                  child: Text('${s['packages']}', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                ),
                                IconButton(
                                  icon: Icon(Icons.add_circle_outline),
                                  color: Theme.of(context).colorScheme.primary,
                                  onPressed: () => setState(() => _stops[idx]['packages']++),
                                ),
                              ],
                            )
                          ],
                        ),
                      );
                    }),
                    
                    const SizedBox(height: AppSpacing.p4),

                    // Optimize toggle
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.p4),
                      decoration: BoxDecoration(color: Theme.of(context).colorScheme.primaryContainer, borderRadius: BorderRadius.circular(12)),
                      child: Row(
                        children: [
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, borderRadius: BorderRadius.circular(12)),
                            child: Icon(Icons.autorenew, color: Theme.of(context).colorScheme.onPrimary, size: 20),
                          ),
                          const SizedBox(width: AppSpacing.p3),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Auto-optimize route', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onPrimaryContainer)),
                                Text('AI will calculate the best order', style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onPrimaryContainer.withValues(alpha: 0.8))),
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
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Theme.of(context).colorScheme.outline, width: 2), // Dashed border not natively supported simply in bare Boxdecoration
                      ),
                      alignment: Alignment.center,
                      child: Column(
                        children: [
                          Container(
                            width: 64, height: 64,
                            decoration: BoxDecoration(color: Theme.of(context).colorScheme.primaryContainer, shape: BoxShape.circle),
                            child: Icon(Icons.upload_file, color: Theme.of(context).colorScheme.primary, size: 28),
                          ),
                          const SizedBox(height: AppSpacing.p4),
                          Text('Upload CSV or Excel file', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                          SizedBox(height: AppSpacing.p2),
                          Text('Drag and drop or click to browse', style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                          SizedBox(height: AppSpacing.p4),
                          AppButton(label: 'Choose file', variant: ButtonVariant.outline, onPressed: () {})
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.p6),
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.p5),
                      decoration: BoxDecoration(color: Theme.of(context).colorScheme.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: Theme.of(context).colorScheme.outline)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.description_outlined, color: Theme.of(context).colorScheme.primary, size: 20),
                              SizedBox(width: AppSpacing.p3),
                              Text('File format', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                            ],
                          ),
                          SizedBox(height: AppSpacing.p3),
                          Text(
                            'Your file should include columns for:\n• Address\n• Package count\n• (Optional) Customer name',
                            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurfaceVariant, height: 1.6),
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
    );
  }
}
