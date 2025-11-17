using System;
using System.IO;
using System.IO.Compression;

namespace NoiseSentinel.BLL.Helpers;

/// <summary>
/// Helper class for compressing and decompressing image data.
/// Images are stored as compressed base64 strings in the database.
/// </summary>
public static class ImageCompressionHelper
{
    private const string ImageDelimiter = "|||";

    /// <summary>
    /// Compress base64 image string using GZip compression.
    /// </summary>
    /// <param name="base64Image">Base64 encoded image string</param>
    /// <returns>Compressed base64 string</returns>
    public static string CompressImage(string base64Image)
    {
        if (string.IsNullOrEmpty(base64Image))
            return string.Empty;

        try
        {
            // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
            var base64Data = base64Image.Contains(",") 
                ? base64Image.Split(',')[1] 
                : base64Image;

            byte[] imageBytes = Convert.FromBase64String(base64Data);

            using var outputStream = new MemoryStream();
            using (var gzipStream = new GZipStream(outputStream, CompressionMode.Compress))
            {
                gzipStream.Write(imageBytes, 0, imageBytes.Length);
            }

            return Convert.ToBase64String(outputStream.ToArray());
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to compress image: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Decompress compressed base64 image string and return as data URI.
    /// </summary>
    /// <param name="compressedBase64">Compressed base64 string</param>
    /// <returns>Data URI format: data:image/jpeg;base64,{base64Data}</returns>
    public static string DecompressImage(string compressedBase64)
    {
        if (string.IsNullOrEmpty(compressedBase64))
            return string.Empty;

        try
        {
            byte[] compressedBytes = Convert.FromBase64String(compressedBase64);

            using var inputStream = new MemoryStream(compressedBytes);
            using var gzipStream = new GZipStream(inputStream, CompressionMode.Decompress);
            using var outputStream = new MemoryStream();
            
            gzipStream.CopyTo(outputStream);
            var base64Data = Convert.ToBase64String(outputStream.ToArray());
            
            // Return as data URI for easy display in web/mobile
            return $"data:image/jpeg;base64,{base64Data}";
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to decompress image: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Compress multiple images and join them with delimiter.
    /// </summary>
    /// <param name="base64Images">Array of base64 image strings</param>
    /// <returns>Single compressed string with multiple images</returns>
    public static string CompressMultipleImages(string[] base64Images)
    {
        if (base64Images == null || base64Images.Length == 0)
            return string.Empty;

        var compressedImages = new string[base64Images.Length];
        for (int i = 0; i < base64Images.Length; i++)
        {
            compressedImages[i] = CompressImage(base64Images[i]);
        }

        return string.Join(ImageDelimiter, compressedImages);
    }

    /// <summary>
    /// Decompress multiple images from a delimited string.
    /// </summary>
    /// <param name="compressedData">Compressed string containing multiple images</param>
    /// <returns>Array of decompressed base64 image strings</returns>
    public static string[] DecompressMultipleImages(string compressedData)
    {
        if (string.IsNullOrEmpty(compressedData))
            return Array.Empty<string>();

        var compressedImages = compressedData.Split(new[] { ImageDelimiter }, StringSplitOptions.RemoveEmptyEntries);
        var decompressedImages = new string[compressedImages.Length];

        for (int i = 0; i < compressedImages.Length; i++)
        {
            decompressedImages[i] = DecompressImage(compressedImages[i]);
        }

        return decompressedImages;
    }

    /// <summary>
    /// Validate if the string is a valid base64 image.
    /// </summary>
    /// <param name="base64String">Base64 string to validate</param>
    /// <returns>True if valid base64</returns>
    public static bool IsValidBase64Image(string base64String)
    {
        if (string.IsNullOrEmpty(base64String))
            return false;

        try
        {
            // Remove data URI prefix if present
            var base64Data = base64String.Contains(",") 
                ? base64String.Split(',')[1] 
                : base64String;

            Convert.FromBase64String(base64Data);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Get the size of compressed data in KB.
    /// </summary>
    /// <param name="compressedBase64">Compressed base64 string</param>
    /// <returns>Size in KB</returns>
    public static double GetCompressedSizeKB(string compressedBase64)
    {
        if (string.IsNullOrEmpty(compressedBase64))
            return 0;

        return Convert.FromBase64String(compressedBase64).Length / 1024.0;
    }
}
