interface Props {
  imageUrl?: string;
}

export default function ProfileAvatar({ imageUrl }: Props) {
  return (
    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg">
      {imageUrl ? (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          No Photo
        </div>
      )}
    </div>
  );
}