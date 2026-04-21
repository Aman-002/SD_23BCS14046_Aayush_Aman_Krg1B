package com.grocery.core.controller;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.model.Product;
import com.grocery.core.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired private ProductService productService;

    // GET /api/products  or  /api/products?name=milk
    @GetMapping
    public ResponseEntity<ApiResponse> getProducts(
            @RequestParam(required = false) String name) {
        try {
            return ResponseEntity.ok(productService.getProducts(name));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // POST /api/products  (Admin)
    @PostMapping
    public ResponseEntity<ApiResponse> addProduct(@RequestBody Product product) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productService.addProduct(product));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // POST /api/products/bulk-upload  (Admin CSV)
    @PostMapping("/bulk-upload")
    public ResponseEntity<ApiResponse> bulkUpload(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productService.bulkUpload(file));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/products/{id}  (Admin)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProduct(
            @PathVariable Integer id, @RequestBody Product product) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, product));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // DELETE /api/products/{id}  (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(productService.deleteProduct(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
