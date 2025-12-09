'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

interface MatchedProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  score: number;
  unitPrice?: number;
  testingFee?: number;
}

interface PriceBreakdown {
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    productCost: number;
    testingFee: number;
  }>;
  subtotal: number;
  testingFees: number;
  logistics: number;
  contingency: number;
  total: number;
}

interface ProposalPDFProps {
  rfpDetails: {
    rfpId: string;
    filename: string;
    createdAt: string;
  };
  matchedProducts: MatchedProduct[];
  priceBreakdown: PriceBreakdown;
  quantities: Record<string, number>;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #000000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 3,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    borderBottom: '1 solid #333333',
    paddingBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #CCCCCC',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
    borderBottom: '2 solid #000000',
  },
  tableCol1: { width: '40%' },
  tableCol2: { width: '15%', textAlign: 'center' },
  tableCol3: { width: '15%', textAlign: 'right' },
  tableCol4: { width: '15%', textAlign: 'right' },
  tableCol5: { width: '15%', textAlign: 'right' },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#333333',
  },
  infoValue: {
    width: '70%',
    color: '#666666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: '#666666',
  },
  priceValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    borderTop: '2 solid #000000',
    backgroundColor: '#F5F5F5',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999999',
    fontSize: 9,
    borderTop: '1 solid #CCCCCC',
    paddingTop: 10,
  },
  productItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderLeft: '3 solid #333333',
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  productDetails: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  matchScore: {
    fontSize: 10,
    color: '#00FF00',
    fontWeight: 'bold',
  },
});

const ProposalDocument = ({ rfpDetails, matchedProducts, priceBreakdown, quantities }: ProposalPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RFP Agent - Proposal</Text>
        <Text style={styles.subtitle}>Automated AI-Powered Proposal Generation</Text>
        <Text style={[styles.subtitle, { fontSize: 10, marginTop: 5 }]}>
          Generated on: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      {/* RFP Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RFP Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>RFP ID:</Text>
          <Text style={styles.infoValue}>{rfpDetails.rfpId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Document:</Text>
          <Text style={styles.infoValue}>{rfpDetails.filename}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Uploaded:</Text>
          <Text style={styles.infoValue}>
            {new Date(rfpDetails.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      {/* Matched Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Matched Products</Text>
        {matchedProducts.map((product, idx) => (
          <View key={product.id} style={styles.productItem}>
            <Text style={styles.productName}>
              #{idx + 1} {product.name}
            </Text>
            <Text style={styles.productDetails}>Category: {product.category}</Text>
            <Text style={styles.productDetails}>
              Quantity: {quantities[product.id] || 1} units
            </Text>
            <Text style={styles.productDetails}>
              Unit Price: ${product.unitPrice?.toFixed(2) || '0.00'}
            </Text>
            {product.description && (
              <Text style={styles.productDetails}>{product.description}</Text>
            )}
            <Text style={styles.matchScore}>Match Score: {product.score}%</Text>
          </View>
        ))}
      </View>

      {/* Price Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol1}>Product</Text>
            <Text style={styles.tableCol2}>Qty</Text>
            <Text style={styles.tableCol3}>Unit Price</Text>
            <Text style={styles.tableCol4}>Testing</Text>
            <Text style={styles.tableCol5}>Total</Text>
          </View>
          {priceBreakdown.products.map((p, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{p.name}</Text>
              <Text style={styles.tableCol2}>{p.quantity}</Text>
              <Text style={styles.tableCol3}>${p.unitPrice.toFixed(2)}</Text>
              <Text style={styles.tableCol4}>${p.testingFee.toFixed(2)}</Text>
              <Text style={styles.tableCol5}>${p.productCost.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal:</Text>
            <Text style={styles.priceValue}>${priceBreakdown.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Testing Fees:</Text>
            <Text style={styles.priceValue}>${priceBreakdown.testingFees.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Logistics (8% of subtotal):</Text>
            <Text style={styles.priceValue}>${priceBreakdown.logistics.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Contingency (5% of subtotal):</Text>
            <Text style={styles.priceValue}>${priceBreakdown.contingency.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
            <Text style={styles.totalValue}>${priceBreakdown.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Terms & Conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={{ fontSize: 9, color: '#666666', lineHeight: 1.5 }}>
          • Prices are valid for 30 days from the date of this proposal{'\n'}
          • Payment terms: Net 30 days from delivery{'\n'}
          • Delivery time: 4-6 weeks from order confirmation{'\n'}
          • All products meet specified certifications and standards{'\n'}
          • Testing fees include standard quality assurance procedures{'\n'}
          • Logistics costs may vary based on delivery location
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        RFP Agent - AI-Powered RFP Automation System | Generated by Advanced AI Agents
      </Text>
    </Page>
  </Document>
);

export default function ProposalPDF({ rfpDetails, matchedProducts, priceBreakdown, quantities }: ProposalPDFProps) {
  const fileName = `Proposal_${rfpDetails.rfpId}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <ProposalDocument
          rfpDetails={rfpDetails}
          matchedProducts={matchedProducts}
          priceBreakdown={priceBreakdown}
          quantities={quantities}
        />
      }
      fileName={fileName}
      style={{
        marginTop: '24px',
        padding: '16px 32px',
        background: 'linear-gradient(45deg, #00FF00, #00FF80)',
        border: '2px solid #00FF00',
        borderRadius: '8px',
        color: '#000',
        fontWeight: 700,
        fontSize: '1.1rem',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(0,255,0,0.6)',
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      {({ loading }) => (loading ? '⏳ Preparing PDF...' : '📥 Download Proposal PDF')}
    </PDFDownloadLink>
  );
}
