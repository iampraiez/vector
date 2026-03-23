import 'package:hive/hive.dart';

part 'pending_delivery.g.dart';

@HiveType(typeId: 0)
class PendingDelivery extends HiveObject {
  @HiveField(0)
  final String stopId;

  @HiveField(1)
  final String localPhotoPath;

  @HiveField(2)
  final String? qrCode;

  @HiveField(3)
  final String? notes;

  @HiveField(4)
  final DateTime createdAt;

  PendingDelivery({
    required this.stopId,
    required this.localPhotoPath,
    this.qrCode,
    this.notes,
    required this.createdAt,
  });
}
