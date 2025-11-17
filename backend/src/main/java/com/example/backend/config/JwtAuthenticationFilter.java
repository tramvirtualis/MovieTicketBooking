package com.example.backend.config;

import com.example.backend.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        String requestPath = request.getRequestURI();
        
        // Skip JWT processing for public endpoints
        if (requestPath.startsWith("/api/public/") || 
            requestPath.startsWith("/api/auth/") ||
            requestPath.startsWith("/api/enums/") ||
            requestPath.startsWith("/api/reviews/movie/") ||
            requestPath.startsWith("/ws/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Only process JWT for API endpoints that require authentication
        if (requestPath.startsWith("/api/") && authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                
                System.out.println("JwtAuthenticationFilter: Processing token for path: " + requestPath);
                
                if (jwtUtils.validateJwtToken(token)) {
                    String username = jwtUtils.getUsernameFromJwtToken(token);
                    String role = jwtUtils.getRoleFromJwtToken(token);
                    
                    System.out.println("JwtAuthenticationFilter: Valid token - username: " + username + ", role: " + role);
                    
                    if (role != null && !role.isEmpty()) {
                        // Chuyển đổi role thành uppercase để đảm bảo consistency
                        String normalizedRole = role.toUpperCase();
                        
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + normalizedRole))
                            );
                        
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        System.out.println("JwtAuthenticationFilter: Authentication set successfully for role: ROLE_" + normalizedRole);
                    } else {
                        System.out.println("JwtAuthenticationFilter: Token is valid but has no role - cannot set authentication");
                    }
                } else {
                    System.out.println("JwtAuthenticationFilter: Invalid token for path: " + requestPath);
                }
            } catch (Exception e) {
                System.out.println("JwtAuthenticationFilter: Error processing token for path: " + requestPath);
                System.out.println("JwtAuthenticationFilter: Exception type: " + e.getClass().getName());
                System.out.println("JwtAuthenticationFilter: Exception message: " + e.getMessage());
                e.printStackTrace();
                // Token không hợp lệ, tiếp tục filter chain mà không set authentication
                // Spring Security sẽ xử lý việc từ chối request nếu cần authentication
            }
        } else if (requestPath.startsWith("/api/customer/")) {
            System.out.println("JwtAuthenticationFilter: Protected path " + requestPath + " - Authorization header: " + (authHeader != null ? "present" : "missing"));
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("JwtAuthenticationFilter: No valid Authorization header found");
            }
        }
        
        filterChain.doFilter(request, response);
    }
}

