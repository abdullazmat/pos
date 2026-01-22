/**
 * React DOM Patch - Prevents removeChild errors
 * This patches the native DOM removeChild method to safely handle
 * errors when React tries to remove nodes that don't exist
 */

if (typeof window !== "undefined") {
  // Store original removeChild
  const originalRemoveChild = Node.prototype.removeChild;

  // Patch removeChild to catch and suppress errors
  Node.prototype.removeChild = function (child) {
    try {
      // Check if child is actually a child of this node
      if (child && child.parentNode === this) {
        return originalRemoveChild.call(this, child);
      } else {
        // Silently skip removal if not a child
        console.debug(
          "[React DOM Patch] Skipped removeChild - node not a child",
        );
        return child;
      }
    } catch (error) {
      // Catch any removeChild errors and suppress them
      console.debug("[React DOM Patch] Caught removeChild error:", error);
      return child;
    }
  };

  // Also patch replaceChild for completeness
  const originalReplaceChild = Node.prototype.replaceChild;

  Node.prototype.replaceChild = function (newChild, oldChild) {
    try {
      if (oldChild && oldChild.parentNode === this) {
        return originalReplaceChild.call(this, newChild, oldChild);
      } else {
        // If old child not found, just append new child
        this.appendChild(newChild);
        return oldChild;
      }
    } catch (error) {
      console.debug("[React DOM Patch] Caught replaceChild error:", error);
      this.appendChild(newChild);
      return oldChild;
    }
  };

  console.log(
    "[React DOM Patch] DOM manipulation methods patched successfully",
  );
}
