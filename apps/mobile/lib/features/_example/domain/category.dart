/// Example feature (data/domain/presentation). Delete once the first real feature lands.
class Category {
  const Category({required this.id, required this.nameAr, required this.nameEn});

  final String id;
  final String nameAr;
  final String nameEn;

  String name(String languageCode) => languageCode == 'en' ? nameEn : nameAr;
}
