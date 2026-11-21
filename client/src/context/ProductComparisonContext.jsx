import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "shopsphere.productComparison.v1";
export const MAX_COMPARISON_PRODUCTS = 4;

const ProductComparisonContext = createContext(null);

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];

  const ids = [];
  for (const candidate of value) {
    const id = Number(candidate);
    if (
      Number.isSafeInteger(id) &&
      id > 0 &&
      !ids.includes(id)
    ) {
      ids.push(id);
    }
    if (ids.length === MAX_COMPARISON_PRODUCTS) break;
  }
  return ids;
}

function readStoredIds() {
  try {
    return normalizeIds(
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    );
  } catch (error) {
    console.warn("Saved product comparison could not be read:", error);
    return [];
  }
}

export function ProductComparisonProvider({ children }) {
  const [productIds, setProductIds] = useState(readStoredIds);
  const idsRef = useRef(productIds);

  const updateProductIds = useCallback((nextIds) => {
    const normalized = normalizeIds(nextIds);
    idsRef.current = normalized;
    setProductIds(normalized);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
    } catch (error) {
      console.warn("Product comparison could not be saved:", error);
    }
  }, [productIds]);

  useEffect(() => {
    const syncFromAnotherTab = (event) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        updateProductIds(JSON.parse(event.newValue || "[]"));
      } catch (error) {
        console.warn("Product comparison could not be synchronized:", error);
        updateProductIds([]);
      }
    };

    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, [updateProductIds]);

  const addProduct = useCallback((value) => {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return { success: false, reason: "invalid" };
    }

    const currentIds = idsRef.current;
    if (currentIds.includes(id)) {
      return { success: false, reason: "duplicate" };
    }
    if (currentIds.length >= MAX_COMPARISON_PRODUCTS) {
      return { success: false, reason: "limit" };
    }

    updateProductIds([...currentIds, id]);
    return { success: true };
  }, [updateProductIds]);

  const removeProduct = useCallback((value) => {
    const id = Number(value);
    updateProductIds(idsRef.current.filter((item) => item !== id));
  }, [updateProductIds]);

  const clearComparison = useCallback(() => {
    updateProductIds([]);
  }, [updateProductIds]);

  const value = useMemo(() => ({
    productIds,
    count: productIds.length,
    maxProducts: MAX_COMPARISON_PRODUCTS,
    addProduct,
    removeProduct,
    clearComparison,
    isCompared: (id) => productIds.includes(Number(id)),
  }), [
    productIds,
    addProduct,
    removeProduct,
    clearComparison,
  ]);

  return (
    <ProductComparisonContext.Provider value={value}>
      {children}
    </ProductComparisonContext.Provider>
  );
}

export function useProductComparison() {
  const context = useContext(ProductComparisonContext);
  if (!context) {
    throw new Error(
      "useProductComparison must be used inside ProductComparisonProvider."
    );
  }
  return context;
}
