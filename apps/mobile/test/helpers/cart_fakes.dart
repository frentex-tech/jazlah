import 'package:jazlah/features/cart/domain/cart.dart';

/// Al Falah's lamb kebab in the mock catalog: 500 g 36.00, 1 kg 62.00, no cut to choose.
const kebab = CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-500g');

/// The same product from another store (Al Nukhba).
const otherStore = CartItemInput(productId: 'p-nukhba-lamb-kebab', sizeId: 'sz-500g');
