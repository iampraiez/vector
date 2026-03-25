import 'package:hive/hive.dart';

part 'pending_delivery.g.dart';

@HiveType(typeId: 0)
class PendingDelivery extends HiveObject {
  @HiveField(0)
  final String stopId;

  @HiveField(1)
  final String localPhotoPath;

  @HiveField(2)
  final String? notes;

  @HiveField(3)
  final DateTime createdAt;

  PendingDelivery({
    required this.stopId,
    required this.localPhotoPath,
    this.notes,
    required this.createdAt,
  });
}
