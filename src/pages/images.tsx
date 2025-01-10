// ... (keep imports)

export default function ImagesPage() {
  // ... (keep existing state)

  const handleGenerateImage = async () => {
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check rate limit before generating
      const { allowed, remaining, resetTime } = await checkRateLimit('image');
      
      if (!allowed) {
        throw new Error(
          `Rate limit reached. You can generate ${remaining} more images after ${
            new Date(resetTime).toLocaleTimeString()
          }`
        );
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const imageUrl = await generateImage(prompt);

      // Increment rate limit after successful generation
      await incrementRateLimit('image');

      const { data: image, error: insertError } = await supabase
        .from('generated_images')
        .insert({
          user_id: user.id,
          prompt: prompt.trim(),
          image_url: imageUrl,
          is_public: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (image) {
        setImages([{ ...image, likes: 0 }, ...images]);
        setPrompt('');
        toast({
          title: 'Success',
          description: `Image generated successfully! You have ${remaining - 1} generations remaining.`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ... (keep rest of the component)
}