package com.example.backend.services;

import com.example.backend.entities.Order;
import com.example.backend.entities.enums.OrderStatus;
import com.example.backend.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public Optional<Order> findByTxnRef(String txnRef) {
        return orderRepository.findByVnpTxnRef(txnRef);
    }

    public Order markAsPaid(Order order,
                            String transactionNo,
                            String bankCode,
                            String responseCode,
                            String transactionStatus,
                            LocalDateTime payDate) {
        order.setStatus(OrderStatus.PAID);
        order.setVnpTransactionNo(transactionNo);
        order.setVnpBankCode(bankCode);
        order.setVnpResponseCode(responseCode);
        order.setVnpTransactionStatus(transactionStatus);
        order.setVnpPayDate(payDate);
        return orderRepository.save(order);
    }

    public Order markAsFailed(Order order,
                              String responseCode,
                              String transactionStatus) {
        order.setStatus(OrderStatus.FAILED);
        order.setVnpResponseCode(responseCode);
        order.setVnpTransactionStatus(transactionStatus);
        return orderRepository.save(order);
    }
}


