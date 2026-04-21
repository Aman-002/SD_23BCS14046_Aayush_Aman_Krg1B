package com.grocery.core.service;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.model.Product;
import com.grocery.core.repository.ProductRepository;
import com.opencsv.CSVReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired private ProductRepository productRepository;

    // ── US005 / US009: View all or search ─────────────────────────────────────
    public ApiResponse getProducts(String name) {
        List<Product> products = (name != null && !name.isBlank())
                ? productRepository.findByProductNameContainingIgnoreCase(name)
                : productRepository.findAll();
        return new ApiResponse(true, "Products fetched", products);
    }

    public ApiResponse getProductById(Integer id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return new ApiResponse(true, "Product found", p);
    }

    // ── US004: Add single product ─────────────────────────────────────────────
    @Transactional
    public ApiResponse addProduct(Product product) {
        if (product.getProductName() == null || product.getProductName().isBlank())
            throw new RuntimeException("Product name cannot be empty");
        if (product.getPrice() > 10000)
            throw new RuntimeException("Price must not exceed 10000");

        productRepository.save(product);
        return new ApiResponse(true, "Product added successfully!", product);
    }

    // ── US004: Bulk CSV upload ────────────────────────────────────────────────
    @Transactional
    public ApiResponse bulkUpload(MultipartFile file) {
        if (file.isEmpty())
            throw new RuntimeException("CSV file is empty");

        List<Product> saved = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] header = reader.readNext(); // skip header row
            String[] row;
            while ((row = reader.readNext()) != null) {
                if (row.length < 5) continue;
                Product p = new Product();
                p.setProductName(row[0].trim());
                p.setDescription(row[1].trim());
                p.setCompanyName(row[2].trim());
                p.setPrice(Double.parseDouble(row[3].trim()));
                p.setStock(Integer.parseInt(row[4].trim()));
                p.setDiscount(row.length > 5 ? Integer.parseInt(row[5].trim()) : 0);
                saved.add(productRepository.save(p));
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV parsing error: " + e.getMessage());
        }
        return new ApiResponse(true, saved.size() + " products uploaded successfully!", saved);
    }

    // ── US003 / US011: Update product ─────────────────────────────────────────
    @Transactional
    public ApiResponse updateProduct(Integer id, Product updated) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (updated.getProductName() != null && !updated.getProductName().isBlank())
            existing.setProductName(updated.getProductName());
        if (updated.getDescription() != null)
            existing.setDescription(updated.getDescription());
        if (updated.getCompanyName() != null)
            existing.setCompanyName(updated.getCompanyName());
        if (updated.getPrice() != null) {
            if (updated.getPrice() > 10000) throw new RuntimeException("Price must not exceed 10000");
            existing.setPrice(updated.getPrice());
        }
        if (updated.getStock() != null)
            existing.setStock(updated.getStock());
        if (updated.getDiscount() != null)
            existing.setDiscount(updated.getDiscount());
        if (updated.getImageUrl() != null)
            existing.setImageUrl(updated.getImageUrl());

        productRepository.save(existing);
        return new ApiResponse(true, "Product updated successfully!", existing);
    }

    // ── US011: Delete product ─────────────────────────────────────────────────
    @Transactional
    public ApiResponse deleteProduct(Integer id) {
        if (!productRepository.existsById(id))
            throw new RuntimeException("Product not found with id: " + id);
        productRepository.deleteById(id);
        return new ApiResponse(true, "Product deleted successfully");
    }
}
