export default function Avatar({ image, name, size = "sm", className = "", style = {} }) {
  let initials = "?";
  if (name) {
    const matches = name.match(/\b\w/g);
    if (matches) {
      initials = matches.join("").substring(0, 2).toUpperCase();
    } else {
      initials = name.substring(0, 2).toUpperCase();
    }
  }

  const hasImage = image && image !== "null" && image !== "undefined";

  // Check if image is a CSS class like 'avatar-rose' or 'bg-emerald'
  const isImageClass = hasImage && (
    image.startsWith("avatar-") || 
    image.startsWith("bg-") ||
    (!image.includes("/") && !image.includes(":") && !image.includes("."))
  );

  const isImageUrl = hasImage && !isImageClass;

  const sizeClass = size ? `avatar-${size}` : "";

  if (isImageUrl) {
    return (
      <img
        src={image}
        alt={name || ""}
        className={`avatar ${sizeClass} ${className}`.trim()}
        style={{ objectFit: "cover", ...style }}
      />
    );
  }

  const colorClass = isImageClass ? image : "avatar-warm";

  return (
    <div 
      className={`avatar ${sizeClass} ${colorClass} ${className}`.trim()}
      style={style}
    >
      {initials}
    </div>
  );
}
