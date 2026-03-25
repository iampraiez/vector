// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pending_delivery.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class PendingDeliveryAdapter extends TypeAdapter<PendingDelivery> {
  @override
  final int typeId = 0;

  @override
  PendingDelivery read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return PendingDelivery(
      stopId: fields[0] as String,
      localPhotoPath: fields[1] as String,
      notes: fields[2] as String?,
      createdAt: fields[3] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, PendingDelivery obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.stopId)
      ..writeByte(1)
      ..write(obj.localPhotoPath)
      ..writeByte(2)
      ..write(obj.notes)
      ..writeByte(3)
      ..write(obj.createdAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PendingDeliveryAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
